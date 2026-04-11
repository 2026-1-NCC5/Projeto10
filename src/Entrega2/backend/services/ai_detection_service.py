from datetime import datetime
from typing import Optional
from uuid import UUID

from sqlalchemy.orm import Session

from models.ai_detection import AIDetection


def list_ai_detections(
    db: Session,
    team_id: Optional[str] = None,
    from_dt: Optional[datetime] = None,
    to_dt: Optional[datetime] = None,
) -> list[dict]:
    query = db.query(AIDetection)

    if team_id:
        query = query.filter(AIDetection.team_id == team_id)
    if from_dt:
        query = query.filter(AIDetection.detected_at >= from_dt)
    if to_dt:
        query = query.filter(AIDetection.detected_at <= to_dt)

    query = query.order_by(AIDetection.detected_at.desc())
    rows = query.all()
    return [_row_to_dict(r) for r in rows]


def _row_to_dict(row: AIDetection) -> dict:
    return {
        "id": str(row.id),
        "item_name": row.item_name,
        "category": row.category,
        "estimated_weight_g": float(row.estimated_weight_g) if row.estimated_weight_g is not None else None,
        "confidence": row.confidence,
        "detected_at": row.detected_at,
        "team_id": str(row.team_id),
        "operator_name": row.operator_name,
        "s3_key": row.s3_key,
    }
