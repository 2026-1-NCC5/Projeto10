from datetime import datetime
from typing import Optional

from sqlalchemy import func
from sqlalchemy.orm import Session

from models.ai_detection import AIDetection
from utils.text import normalize_item_name


CATEGORIES = ["arroz", "feijao", "outros"]


def _apply_ai_range(query, date_from: Optional[datetime], date_to: Optional[datetime]):
    if date_from is not None:
        query = query.filter(AIDetection.detected_at >= date_from)
    if date_to is not None:
        query = query.filter(AIDetection.detected_at < date_to)
    return query


def get_overview(
    db: Session,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
) -> dict:
    agg = _apply_ai_range(
        db.query(
            func.coalesce(func.sum(AIDetection.estimated_weight_g), 0),
            func.coalesce(func.sum(AIDetection.estimated_price_brl), 0),
        ),
        date_from,
        date_to,
    ).one()
    total_g = float(agg[0] or 0)
    total_brl = float(agg[1] or 0)

    category_rows = _apply_ai_range(
        db.query(
            AIDetection.category,
            func.coalesce(func.sum(AIDetection.estimated_weight_g), 0).label("weight"),
            func.coalesce(func.sum(AIDetection.estimated_price_brl), 0).label("price"),
            func.count(AIDetection.id).label("count"),
        ),
        date_from,
        date_to,
    ).group_by(AIDetection.category).all()

    categories: dict[str, dict] = {c: {"category": c, "total_g": 0.0, "total_brl": 0.0, "count": 0} for c in CATEGORIES}
    for category, weight, price, count in category_rows:
        key = category if category in categories else "outros"
        categories[key]["total_g"] += float(weight or 0)
        categories[key]["total_brl"] += float(price or 0)
        categories[key]["count"] += int(count or 0)

    item_rows = _apply_ai_range(
        db.query(
            AIDetection.item_name,
            AIDetection.category,
            func.coalesce(func.sum(AIDetection.estimated_weight_g), 0).label("weight"),
            func.count(AIDetection.id).label("count"),
        ),
        date_from,
        date_to,
    ).group_by(AIDetection.item_name, AIDetection.category).all()

    items: dict[tuple[str, str], dict] = {}
    for item_name, category, weight, count in item_rows:
        name = normalize_item_name(item_name) or "desconhecido"
        key = (name, category)
        entry = items.setdefault(key, {"item_name": name, "category": category, "total_g": 0.0, "count": 0})
        entry["total_g"] += float(weight or 0)
        entry["count"] += int(count or 0)

    items_list = sorted(items.values(), key=lambda i: i["total_g"], reverse=True)

    ts_rows = _apply_ai_range(
        db.query(
            func.date(AIDetection.detected_at).label("d"),
            func.coalesce(func.sum(AIDetection.estimated_weight_g), 0).label("w"),
            func.count(AIDetection.id).label("c"),
        ),
        date_from,
        date_to,
    ).group_by(func.date(AIDetection.detected_at)).all()

    timeseries = sorted(
        [{"date": str(d), "total_g": float(w or 0), "count": int(c or 0)} for d, w, c in ts_rows],
        key=lambda e: e["date"],
    )

    distinct_teams = _apply_ai_range(
        db.query(func.count(func.distinct(AIDetection.team_id))),
        date_from,
        date_to,
    ).scalar() or 0

    return {
        "total_collected_g": total_g,
        "total_collected_brl": total_brl,
        "avg_price_per_kg": round(total_brl / (total_g / 1000.0), 2) if total_g > 0 else 0.0,
        "collectors_count": int(distinct_teams),
        "categories": list(categories.values()),
        "items": items_list,
        "timeseries": timeseries,
    }


def get_filter_bounds(db: Session) -> dict:
    ai_min, ai_max = db.query(
        func.min(AIDetection.detected_at), func.max(AIDetection.detected_at)
    ).one()

    return {
        "min_date": ai_min.isoformat() if ai_min else None,
        "max_date": ai_max.isoformat() if ai_max else None,
    }
