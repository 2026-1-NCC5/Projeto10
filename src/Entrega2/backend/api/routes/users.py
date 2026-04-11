from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from api.dependencies import get_db, get_current_user, require_admin
from api.schemas import RoleUpdateRequest, UserListResponse, UserResponse
from models.user import User
from services.team_service import get_team_member
from services.user_service import get_all_users, update_user_role


router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("", response_model=list[UserListResponse])
def list_users(
    unassigned: Optional[bool] = Query(default=None),
    role: Optional[str] = Query(default=None),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return get_all_users(db, unassigned_only=unassigned is True, role=role)


@router.get("/me", response_model=UserResponse)
def get_me(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    membership = get_team_member(db, current_user.id)
    return UserResponse(
        id=str(current_user.id),
        name=current_user.name,
        email=current_user.email,
        role=current_user.role,
        team_id=str(membership.team_id) if membership else None,
    )


@router.put("/me/role", response_model=UserResponse)
def set_role(
    body: RoleUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user = update_user_role(db, current_user.id, body.role)
    membership = get_team_member(db, user.id)
    return UserResponse(
        id=str(user.id),
        name=user.name,
        email=user.email,
        role=user.role,
        team_id=str(membership.team_id) if membership else None,
    )
