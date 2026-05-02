import logging

from sqlalchemy import func
from sqlalchemy.orm import Session

from models.ai_detection import AIDetection
from models.team import CollectionEntry, Team
from models.user import User
from services.s3_service import build_presigned_url
from utils.text import normalize_item_name


logger = logging.getLogger(__name__)


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
            func.coalesce(func.sum(AIDetection.estimated_price_brl), 0).label("price"),
        )
        .filter(AIDetection.team_id == team_id)
        .group_by(AIDetection.category)
        .all()
    )
    totals = {c: {"count": 0, "weight_g": 0.0, "price_brl": 0.0} for c in CATEGORIES}
    for category, count, weight, price in rows:
        key = category if category in totals else "outros"
        totals[key]["count"] += int(count or 0)
        totals[key]["weight_g"] += float(weight or 0)
        totals[key]["price_brl"] += float(price or 0)
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


def _avg_price_per_kg(price_brl: float, weight_g: float) -> float:
    return round(price_brl / (weight_g / 1000.0), 2) if weight_g > 0 else 0.0


def get_team_summary(db: Session, team_id: str) -> dict:
    team = db.query(Team).filter(Team.id == team_id).first()
    ai_totals = _ai_totals_by_category(db, team_id)

    counts_by_category = [
        {
            "category": c,
            "total_weight_g": ai_totals[c]["weight_g"],
            "count": ai_totals[c]["count"],
            "total_price_brl": ai_totals[c]["price_brl"],
            "avg_price_per_kg": _avg_price_per_kg(ai_totals[c]["price_brl"], ai_totals[c]["weight_g"]),
        }
        for c in CATEGORIES
    ]
    total_g = sum(ai_totals[c]["weight_g"] for c in CATEGORIES)
    total_brl = sum(ai_totals[c]["price_brl"] for c in CATEGORIES)

    rows = (
        db.query(
            func.date(AIDetection.detected_at).label("d"),
            func.count(AIDetection.id).label("c"),
            func.coalesce(func.sum(AIDetection.estimated_weight_g), 0).label("w"),
            func.coalesce(func.sum(AIDetection.estimated_price_brl), 0).label("p"),
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
            "total_price_brl": float(p or 0),
        }
        for d, c, w, p in rows
    ]

    return {
        "team_id": team_id,
        "team_name": team.name if team else None,
        "totals": {
            "rice_g": ai_totals["arroz"]["weight_g"],
            "beans_g": ai_totals["feijao"]["weight_g"],
            "others_g": ai_totals["outros"]["weight_g"],
            "total_g": total_g,
            "rice_brl": ai_totals["arroz"]["price_brl"],
            "beans_brl": ai_totals["feijao"]["price_brl"],
            "others_brl": ai_totals["outros"]["price_brl"],
            "total_brl": total_brl,
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
                "total_price_brl": ai_totals[c]["price_brl"],
                "avg_price_per_kg": _avg_price_per_kg(ai_totals[c]["price_brl"], ai_totals[c]["weight_g"]),
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


def _build_evidence(db: Session, team_id: str, category: str, limit: int = 10) -> list[dict]:
    try:
        rows = (
            db.query(AIDetection)
            .filter(
                AIDetection.team_id == team_id,
                AIDetection.category == category,
            )
            .order_by(AIDetection.detected_at.desc())
            .limit(limit)
            .all()
        )
        return [
            {
                "detection_id": str(r.id),
                "image_url": build_presigned_url(r.s3_key),
                "detected_at": r.detected_at,
                "confidence": float(r.confidence or 0),
                "item_name": r.item_name,
            }
            for r in rows
        ]
    except Exception as exc:
        logger.warning("Falha ao montar evidência (%s/%s): %s", team_id, category, exc)
        return []


def get_team_comparison(db: Session, team_id: str) -> dict:
    manual = _manual_totals_by_category(db, team_id)
    ai = _ai_totals_by_category(db, team_id)

    categories = []
    for c in CATEGORIES:
        m_count = manual[c]["count"]
        a_count = ai[c]["count"]
        categories.append(
            {
                "category": c,
                "manual_count": m_count,
                "manual_weight_g": manual[c]["weight_g"],
                "ai_count": a_count,
                "ai_weight_g": ai[c]["weight_g"],
                "ai_price_brl": ai[c]["price_brl"],
                "match": m_count == a_count,
                "evidence": _build_evidence(db, team_id, c),
            }
        )

    return {"team_id": team_id, "categories": categories}


def get_operator_comparison(db: Session, team_id: str) -> dict:
    manual_rows = (
        db.query(
            User.id.label("user_id"),
            User.name.label("user_name"),
            func.coalesce(func.sum(CollectionEntry.weight), 0).label("weight"),
            func.coalesce(func.sum(CollectionEntry.quantity), 0).label("count"),
        )
        .join(CollectionEntry, CollectionEntry.user_id == User.id)
        .filter(CollectionEntry.team_id == team_id)
        .group_by(User.id, User.name)
        .all()
    )

    ai_rows = (
        db.query(
            AIDetection.operator_name.label("operator_name"),
            func.coalesce(func.sum(AIDetection.estimated_weight_g), 0).label("weight"),
            func.coalesce(func.sum(AIDetection.estimated_price_brl), 0).label("price"),
            func.count(AIDetection.id).label("count"),
        )
        .filter(AIDetection.team_id == team_id)
        .group_by(AIDetection.operator_name)
        .all()
    )

    by_name: dict[str, dict] = {}
    for row in manual_rows:
        key = row.user_name or "Sem nome"
        entry = by_name.setdefault(
            key, {"operator_name": key, "manual_weight_g": 0.0, "manual_count": 0, "ai_weight_g": 0.0, "ai_count": 0, "ai_price_brl": 0.0}
        )
        entry["manual_weight_g"] += float(row.weight or 0)
        entry["manual_count"] += int(row.count or 0)

    for row in ai_rows:
        key = row.operator_name or "Sem operador"
        entry = by_name.setdefault(
            key, {"operator_name": key, "manual_weight_g": 0.0, "manual_count": 0, "ai_weight_g": 0.0, "ai_count": 0, "ai_price_brl": 0.0}
        )
        entry["ai_weight_g"] += float(row.weight or 0)
        entry["ai_count"] += int(row.count or 0)
        entry["ai_price_brl"] += float(row.price or 0)

    return {"team_id": team_id, "operators": list(by_name.values())}


def get_food_distribution(db: Session, team_id: str) -> dict:
    ai_rows = (
        db.query(
            AIDetection.item_name,
            AIDetection.category,
            func.count(AIDetection.id).label("count"),
            func.coalesce(func.sum(AIDetection.estimated_weight_g), 0).label("weight"),
            func.coalesce(func.sum(AIDetection.estimated_price_brl), 0).label("price"),
        )
        .filter(AIDetection.team_id == team_id)
        .group_by(AIDetection.item_name, AIDetection.category)
        .all()
    )

    manual_rows = (
        db.query(
            CollectionEntry.item_name,
            CollectionEntry.item_type,
            func.coalesce(func.sum(CollectionEntry.quantity), 0).label("count"),
            func.coalesce(func.sum(CollectionEntry.weight), 0).label("weight"),
        )
        .filter(CollectionEntry.team_id == team_id)
        .group_by(CollectionEntry.item_name, CollectionEntry.item_type)
        .all()
    )

    merged: dict[tuple[str, str], dict] = {}

    for item_name, category, count, weight, price in ai_rows:
        normalized = normalize_item_name(item_name) or "desconhecido"
        key = (normalized, category)
        entry = merged.setdefault(
            key,
            {
                "item_name": normalized,
                "category": category,
                "manual_count": 0,
                "manual_weight_g": 0.0,
                "ai_count": 0,
                "ai_weight_g": 0.0,
                "ai_price_brl": 0.0,
            },
        )
        entry["ai_count"] += int(count or 0)
        entry["ai_weight_g"] += float(weight or 0)
        entry["ai_price_brl"] += float(price or 0)

    for item_name, item_type, count, weight in manual_rows:
        normalized = normalize_item_name(item_name) or normalize_item_name(item_type) or "outros"
        category = _MANUAL_TYPE_TO_CATEGORY.get(item_type, "outros")
        key = (normalized, category)
        entry = merged.setdefault(
            key,
            {
                "item_name": normalized,
                "category": category,
                "manual_count": 0,
                "manual_weight_g": 0.0,
                "ai_count": 0,
                "ai_weight_g": 0.0,
                "ai_price_brl": 0.0,
            },
        )
        entry["manual_count"] += int(count or 0)
        entry["manual_weight_g"] += float(weight or 0)

    items = sorted(merged.values(), key=lambda x: (x["category"], x["item_name"]))
    return {"team_id": team_id, "items": items}
