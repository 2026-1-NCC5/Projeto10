from fastapi import APIRouter
from sqlalchemy import text

from api.schemas import HealthResponse
from database import SessionLocal


router = APIRouter(tags=["health"])


@router.get("/api/health", response_model=HealthResponse)
def health_check():
    db_ok = False
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        db_ok = True
    except Exception:
        pass

    return HealthResponse(status="ok", database=db_ok)
