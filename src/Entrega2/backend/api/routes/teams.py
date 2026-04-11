from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from api.dependencies import get_current_user, get_db, require_admin
from api.schemas import (
    AddTeamMemberRequest,
    CreateTeamRequest,
    ReallocateMemberRequest,
    TeamMemberResponse,
    TeamResponse,
    TeamUpdateRequest,
    TeamValidationResponse,
)
from models.user import User
from services.team_service import (
    add_member_to_team,
    create_team,
    delete_team,
    get_all_teams,
    get_team_by_id,
    reallocate_member,
    remove_member_from_team,
    update_team,
    validate_team_invariant,
)


router = APIRouter(prefix="/api/teams", tags=["teams"])


@router.get("", response_model=list[TeamResponse])
def list_teams(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return get_all_teams(db)


@router.get("/me", response_model=Optional[TeamResponse])
def get_my_team(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    from services.team_service import get_team_member
    membership = get_team_member(db, current_user.id)
    if not membership:
        return None
    return get_team_by_id(db, str(membership.team_id))


@router.post("", response_model=TeamResponse, status_code=status.HTTP_201_CREATED)
def create_new_team(
    body: CreateTeamRequest,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    name = body.name.strip()
    if not name:
        raise HTTPException(status_code=422, detail="Nome da equipe não pode ser vazio")
    if len(name) > 80:
        raise HTTPException(status_code=422, detail="Nome deve ter no máximo 80 caracteres")
    if body.description and len(body.description) > 300:
        raise HTTPException(status_code=422, detail="Descrição deve ter no máximo 300 caracteres")

    return create_team(
        db,
        name=name,
        description=body.description,
        coordinator_ids=body.coordinator_ids,
        member_ids=body.member_ids,
    )


@router.patch("/{team_id}", response_model=TeamResponse)
def rename_team(
    team_id: str,
    body: TeamUpdateRequest,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return update_team(db, team_id, name=body.name, description=body.description)


@router.delete("/{team_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_team(
    team_id: str,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    delete_team(db, team_id)


@router.get("/{team_id}", response_model=TeamResponse)
def get_single_team(
    team_id: str,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return get_team_by_id(db, team_id)


@router.get("/{team_id}/validate", response_model=TeamValidationResponse)
def validate_team(
    team_id: str,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return validate_team_invariant(db, team_id)


@router.post(
    "/{team_id}/members",
    response_model=TeamMemberResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_member(
    team_id: str,
    body: AddTeamMemberRequest,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return add_member_to_team(db, team_id, body.user_id)


@router.delete(
    "/{team_id}/members/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def remove_member(
    team_id: str,
    user_id: str,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    remove_member_from_team(db, team_id, user_id)


@router.post(
    "/{team_id}/reallocate",
    response_model=TeamMemberResponse,
    status_code=status.HTTP_200_OK,
)
def reallocate(
    team_id: str,
    body: ReallocateMemberRequest,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return reallocate_member(db, team_id, body.user_id)
