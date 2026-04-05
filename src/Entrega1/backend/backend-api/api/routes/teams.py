from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from api.dependencies import get_current_user, get_db, require_admin, require_admin_or_coordinator
from models.team import TeamMember
from api.schemas import (
    AddTeamMemberRequest,
    CreateTeamRequest,
    JoinRequestResponse,
    TeamMemberResponse,
    TeamResponse,
    UpdateJoinRequestRequest,
)
from models.user import User
from services.team_service import (
    add_member_to_team,
    create_join_request,
    create_team,
    get_all_teams,
    get_join_requests,
    remove_member_from_team,
    update_join_request,
)


router = APIRouter(prefix="/api/teams", tags=["teams"])


@router.get("", response_model=list[TeamResponse])
def list_teams(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return get_all_teams(db)


@router.post("", response_model=TeamResponse, status_code=status.HTTP_201_CREATED)
def create_new_team(
    body: CreateTeamRequest,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    if not body.name.strip():
        raise HTTPException(status_code=422, detail="Nome da equipe não pode ser vazio")
    if len(body.name) > 80:
        raise HTTPException(status_code=422, detail="Nome da equipe deve ter no máximo 80 caracteres")
    if body.description and len(body.description) > 300:
        raise HTTPException(status_code=422, detail="Descrição deve ter no máximo 300 caracteres")
    if body.max_members < 1:
        raise HTTPException(status_code=422, detail="Número máximo de membros deve ser pelo menos 1")

    team = create_team(
        db,
        body.name.strip(),
        body.description,
        body.max_members,
        body.leader_id,
        current_user.id,
    )
    teams = get_all_teams(db)
    return next(t for t in teams if t["id"] == str(team.id))


@router.post("/{team_id}/join-requests", response_model=JoinRequestResponse, status_code=status.HTTP_201_CREATED)
def request_join(
    team_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    join_request = create_join_request(db, team_id, current_user.id)
    user = db.query(User).filter(User.id == join_request.user_id).first()
    return {
        "id": str(join_request.id),
        "user_id": str(join_request.user_id),
        "user_name": user.name if user else "",
        "team_id": str(join_request.team_id),
        "status": join_request.status,
        "created_at": join_request.created_at,
    }


@router.get("/{team_id}/join-requests", response_model=list[JoinRequestResponse])
def list_join_requests(
    team_id: str,
    current_user: User = Depends(require_admin_or_coordinator),
    db: Session = Depends(get_db),
):
    return get_join_requests(db, team_id)


@router.patch("/{team_id}/join-requests/{request_id}", response_model=JoinRequestResponse)
def handle_join_request(
    team_id: str,
    request_id: str,
    body: UpdateJoinRequestRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "admin":
        if current_user.role == "coordinator":
            leadership = (
                db.query(TeamMember)
                .filter(
                    TeamMember.team_id == team_id,
                    TeamMember.user_id == current_user.id,
                    TeamMember.role == "leader",
                )
                .first()
            )
            if not leadership:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acesso negado")
        else:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acesso negado")
    return update_join_request(db, team_id, request_id, body.status)


@router.post("/{team_id}/members", response_model=TeamMemberResponse, status_code=status.HTTP_201_CREATED)
def add_member(
    team_id: str,
    body: AddTeamMemberRequest,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return add_member_to_team(db, team_id, body.user_id, body.role)


@router.delete("/{team_id}/members/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_member(
    team_id: str,
    user_id: str,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    remove_member_from_team(db, team_id, user_id)
