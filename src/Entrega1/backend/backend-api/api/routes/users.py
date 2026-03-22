from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from api.dependencies import get_db, get_current_user
from api.schemas import RoleUpdateRequest, UserResponse
from models.user import User
from services.user_service import update_user_role


router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse(
        id=str(current_user.id),
        name=current_user.name,
        email=current_user.email,
        role=current_user.role,
    )


@router.put("/me/role", response_model=UserResponse)
def set_role(
    body: RoleUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user = update_user_role(db, current_user.id, body.role)
    return UserResponse(
        id=str(user.id),
        name=user.name,
        email=user.email,
        role=user.role,
    )
