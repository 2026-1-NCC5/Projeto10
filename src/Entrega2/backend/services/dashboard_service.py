from sqlalchemy import func
from sqlalchemy.orm import Session

from models.ai_detection import AIDetection
from models.team import CollectionEntry, Team
from services.s3_service import build_presigned_url


CATEGORIES = ["arroz", "feijao", "outros"]

_MANUAL_TYPE_TO_CATEGORY = {
    "Arroz": "arroz",
    "Feijao": "feijao",
    "Outros": "outros",
}


def _ai_totals_by_category(db: Session, team_id: str) -> dict[str, dict]:
    rows = (
        db.query(
            AIDetection.category,
            func.count(AIDetection.id).label("count"),
            func.coalesce(func.sum(AIDetection.estimated_weight_g), 0).label("weight"),
        )
        .filter(AIDetection.team_id == team_id)
        .group_by(AIDetection.category)
        .all()
    )
    totals = {c: {"count": 0, "weight_g": 0.0} for c in CATEGORIES}
    for category, count, weight in rows:
        key = category if category in totals else "outros"
        totals[key]["count"] += int(count or 0)
        totals[key]["weight_g"] += float(weight or 0)
    return totals


def _manual_totals_by_category(db: Session, team_id: str) -> dict[str, dict]:
    rows = (
        db.query(
            CollectionEntry.item_type,
            func.coalesce(func.sum(CollectionEntry.quantity), 0).label("count"),
            func.coalesce(func.sum(CollectionEntry.weight), 0).label("weight"),
        )
        .filter(CollectionEntry.team_id == team_id)
        .group_by(CollectionEntry.item_type)
        .all()
    )
    totals = {c: {"count": 0, "weight_g": 0.0} for c in CATEGORIES}
    for item_type, count, weight in rows:
        key = _MANUAL_TYPE_TO_CATEGORY.get(item_type, "outros")
        totals[key]["count"] += int(count or 0)
        totals[key]["weight_g"] += float(weight or 0)
    return totals


def get_team_summary(db: Session, team_id: str) -> dict:
    team = db.query(Team).filter(Team.id == team_id).first()
    ai_totals = _ai_totals_by_category(db, team_id)

    counts_by_category = [
        {
            "category": c,
            "total_weight_g": ai_totals[c]["weight_g"],
            "count": ai_totals[c]["count"],
        }
        for c in CATEGORIES
    ]
    total_g = sum(ai_totals[c]["weight_g"] for c in CATEGORIES)

    rows = (
        db.query(
            func.date(AIDetection.detected_at).label("d"),
            func.count(AIDetection.id).label("c"),
            func.coalesce(func.sum(AIDetection.estimated_weight_g), 0).label("w"),
        )
        .filter(AIDetection.team_id == team_id)
        .group_by(func.date(AIDetection.detected_at))
        .order_by(func.date(AIDetection.detected_at))
        .all()
    )
    timeseries = [
        {
            "date": str(d),
            "count": int(c or 0),
            "total_weight_g": float(w or 0),
        }
        for d, c, w in rows
    ]

    return {
        "team_id": team_id,
        "team_name": team.name if team else None,
        "totals": {
            "rice_g": ai_totals["arroz"]["weight_g"],
            "beans_g": ai_totals["feijao"]["weight_g"],
            "others_g": ai_totals["outros"]["weight_g"],
            "total_g": total_g,
        },
        "counts_by_category": counts_by_category,
        "timeseries": timeseries,
    }


def get_all_teams_summary(db: Session) -> dict:
    teams = db.query(Team).all()
    out = []
    for team in teams:
        ai_totals = _ai_totals_by_category(db, str(team.id))
        by_category = [
            {
                "category": c,
                "total_weight_g": ai_totals[c]["weight_g"],
                "count": ai_totals[c]["count"],
            }
            for c in CATEGORIES
        ]
        out.append(
            {
                "team_id": str(team.id),
                "team_name": team.name,
                "total_weight_g": sum(v["weight_g"] for v in ai_totals.values()),
                "total_count": sum(v["count"] for v in ai_totals.values()),
                "by_category": by_category,
            }
        )
    return {"teams": out}


def get_team_comparison(db: Session, team_id: str) -> dict:
    manual = _manual_totals_by_category(db, team_id)
    ai = _ai_totals_by_category(db, team_id)

    categories = []
    for c in CATEGORIES:
        m_count = manual[c]["count"]
        a_count = ai[c]["count"]
        match = m_count == a_count
        evidence = []
        if not match:
            rows = (
                db.query(AIDetection)
                .filter(
                    AIDetection.team_id == team_id,
                    AIDetection.category == c,
                )
                .order_by(AIDetection.detected_at.desc())
                .limit(10)
                .all()
            )
            evidence = [
                {
                    "detection_id": str(r.id),
                    "image_url": build_presigned_url(r.s3_key),
                    "detected_at": r.detected_at,
                    "confidence": r.confidence,
                }
                for r in rows
            ]
        categories.append(
            {
                "category": c,
                "manual_count": m_count,
                "manual_weight_g": manual[c]["weight_g"],
                "ai_count": a_count,
                "ai_weight_g": ai[c]["weight_g"],
                "match": match,
                "evidence": evidence,
            }
        )

    return {"team_id": team_id, "categories": categories}
