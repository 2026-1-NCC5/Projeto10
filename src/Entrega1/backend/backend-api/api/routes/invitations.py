from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from api.dependencies import get_current_user, get_db
from api.schemas import SendInvitationRequest, TeamInvitationResponse
from models.team import TeamMember
from models.user import User
from services.invitation_service import (
    accept_invitation,
    get_my_invitations,
    reject_invitation,
    send_invitation,
)
from fastapi import HTTPException


router = APIRouter(prefix="/api", tags=["invitations"])


def _require_team_invite_permission(team_id: str, current_user: User, db: Session) -> None:
    if current_user.role == "admin":
        return
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
        if leadership:
            return
    raise HTTPException(status_code=403, detail="Acesso negado")


@router.post(
    "/teams/{team_id}/invitations",
    response_model=TeamInvitationResponse,
    status_code=status.HTTP_201_CREATED,
)
def send_team_invitation(
    team_id: str,
    body: SendInvitationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _require_team_invite_permission(team_id, current_user, db)
    return send_invitation(db, team_id, body.user_id, current_user.id)


@router.get("/invitations/me", response_model=list[TeamInvitationResponse])
def list_my_invitations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return get_my_invitations(db, current_user.id)


@router.patch("/invitations/{invitation_id}/accept", response_model=TeamInvitationResponse)
def accept_my_invitation(
    invitation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return accept_invitation(db, invitation_id, current_user.id)


@router.patch("/invitations/{invitation_id}/reject", response_model=TeamInvitationResponse)
def reject_my_invitation(
    invitation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return reject_invitation(db, invitation_id, current_user.id)
