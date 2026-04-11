from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from api.dependencies import get_current_user, get_db
from api.schemas import AIDetectionResponse
from models.user import User
from services.ai_detection_service import list_ai_detections
from services.s3_service import build_presigned_url


router = APIRouter(prefix="/api/ai-detections", tags=["ai-detections"])


@router.get("", response_model=list[AIDetectionResponse])
def get_ai_detections(
    team_id: Optional[str] = Query(default=None),
    from_dt: Optional[datetime] = Query(default=None, alias="from"),
    to_dt: Optional[datetime] = Query(default=None, alias="to"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rows = list_ai_detections(db, team_id=team_id, from_dt=from_dt, to_dt=to_dt)
    for row in rows:
        row["image_url"] = build_presigned_url(row.get("s3_key"))
    return rows
