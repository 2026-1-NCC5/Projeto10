from sqlalchemy import func
from sqlalchemy.orm import Session

from models.ai_detection import AIDetection
from models.team import Team


def get_team_ranking(db: Session, limit: int = 15, offset: int = 0) -> dict:
    total_g_expr = func.coalesce(func.sum(AIDetection.estimated_weight_g), 0).label("total_g")
    count_expr = func.count(AIDetection.id).label("detection_count")

    base = (
        db.query(
            Team.id.label("team_id"),
            Team.name.label("team_name"),
            total_g_expr,
            count_expr,
        )
        .outerjoin(AIDetection, AIDetection.team_id == Team.id)
        .group_by(Team.id, Team.name)
        .order_by(total_g_expr.desc(), Team.name.asc())
    )

    total = db.query(func.count(Team.id)).scalar() or 0

    rows = base.limit(limit).offset(offset).all()

    items = [
        {
            "rank": offset + idx + 1,
            "team_id": str(row.team_id),
            "team_name": row.team_name,
            "total_g": float(row.total_g or 0),
            "detection_count": int(row.detection_count or 0),
        }
        for idx, row in enumerate(rows)
    ]

    return {"total": int(total), "items": items}
