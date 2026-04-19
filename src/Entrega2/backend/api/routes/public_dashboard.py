from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from api.dependencies import get_db
from services.public_dashboard_service import get_filter_bounds, get_overview


router = APIRouter(prefix="/api/public/dashboard", tags=["public-dashboard"])


def _parse_date(value: Optional[str]) -> Optional[datetime]:
    if not value:
        return None
    try:
        return datetime.fromisoformat(value)
    except ValueError:
        return None


@router.get("/overview")
def public_overview(
    date_from: Optional[str] = Query(None, alias="from"),
    date_to: Optional[str] = Query(None, alias="to"),
    db: Session = Depends(get_db),
):
    return get_overview(db, _parse_date(date_from), _parse_date(date_to))


@router.get("/filters")
def public_filters(db: Session = Depends(get_db)):
    return get_filter_bounds(db)
