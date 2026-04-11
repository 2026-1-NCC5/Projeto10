from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from api.dependencies import get_db, require_admin, require_dashboard_access
from api.schemas import (
    DashboardAllSummaryResponse,
    DashboardComparisonResponse,
    DashboardSummaryResponse,
)
from models.user import User
from services.dashboard_service import (
    get_all_teams_summary,
    get_team_comparison,
    get_team_summary,
)
from services.team_service import get_team_member


router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


def _resolve_team_access(current_user: User, team_id: str, db: Session) -> str:
    if current_user.role == "admin":
        return team_id
    membership = get_team_member(db, current_user.id)
    if not membership or str(membership.team_id) != str(team_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado a esta equipe",
        )
    return team_id


@router.get("/summary", response_model=DashboardSummaryResponse)
def dashboard_summary(
    team_id: str = Query(...),
    current_user: User = Depends(require_dashboard_access),
    db: Session = Depends(get_db),
):
    _resolve_team_access(current_user, team_id, db)
    return get_team_summary(db, team_id)


@router.get("/summary/all", response_model=DashboardAllSummaryResponse)
def dashboard_summary_all(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return get_all_teams_summary(db)


@router.get("/comparison", response_model=DashboardComparisonResponse)
def dashboard_comparison(
    team_id: str = Query(...),
    current_user: User = Depends(require_dashboard_access),
    db: Session = Depends(get_db),
):
    _resolve_team_access(current_user, team_id, db)
    return get_team_comparison(db, team_id)
