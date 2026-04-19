from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from api.dependencies import get_current_user, get_db
from api.schemas import RankingResponse
from models.user import User
from services.ranking_service import get_team_ranking


router = APIRouter(prefix="/api/ranking", tags=["ranking"])


@router.get("/teams", response_model=RankingResponse)
def teams_ranking(
    limit: int = Query(15, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return get_team_ranking(db, limit=limit, offset=offset)
