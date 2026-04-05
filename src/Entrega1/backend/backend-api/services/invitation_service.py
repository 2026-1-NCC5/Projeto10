from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from models.invitation import TeamInvitation
from models.team import Team, TeamMember
from models.user import User


def _count_members(db: Session, team_id: UUID) -> int:
    from sqlalchemy import func
    return (
        db.query(func.count(TeamMember.id))
        .filter(TeamMember.team_id == team_id)
        .scalar()
        or 0
    )


def send_invitation(db: Session, team_id: str, user_id: str, invited_by_id: UUID) -> dict:
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Equipe não encontrada")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    if user.role != "admin":
        existing_member = db.query(TeamMember).filter(TeamMember.user_id == user_id).first()
        if existing_member:
            raise HTTPException(status_code=400, detail="Usuário já pertence a uma equipe")

    existing_invitation = (
        db.query(TeamInvitation)
        .filter(
            TeamInvitation.team_id == team_id,
            TeamInvitation.user_id == user_id,
            TeamInvitation.status == "pending",
        )
        .first()
    )
    if existing_invitation:
        raise HTTPException(status_code=400, detail="Convite já enviado para este usuário")

    invitation = TeamInvitation(
        team_id=team_id,
        user_id=user_id,
        invited_by=invited_by_id,
        status="pending",
    )
    db.add(invitation)
    db.commit()
    db.refresh(invitation)

    inviter = db.query(User).filter(User.id == invited_by_id).first()
    return {
        "id": str(invitation.id),
        "team_id": str(invitation.team_id),
        "team_name": team.name,
        "invited_by_name": inviter.name if inviter else "",
        "status": invitation.status,
        "created_at": invitation.created_at,
    }


def get_my_invitations(db: Session, user_id: UUID) -> list[dict]:
    rows = (
        db.query(TeamInvitation, Team, User)
        .join(Team, Team.id == TeamInvitation.team_id)
        .join(User, User.id == TeamInvitation.invited_by)
        .filter(
            TeamInvitation.user_id == user_id,
            TeamInvitation.status == "pending",
        )
        .all()
    )
    return [
        {
            "id": str(inv.id),
            "team_id": str(inv.team_id),
            "team_name": team.name,
            "invited_by_name": inviter.name,
            "status": inv.status,
            "created_at": inv.created_at,
        }
        for inv, team, inviter in rows
    ]


def accept_invitation(db: Session, invitation_id: str, user_id: UUID) -> dict:
    invitation = (
        db.query(TeamInvitation)
        .filter(TeamInvitation.id == invitation_id, TeamInvitation.user_id == user_id)
        .first()
    )
    if not invitation:
        raise HTTPException(status_code=404, detail="Convite não encontrado")
    if invitation.status != "pending":
        raise HTTPException(status_code=400, detail="Convite já processado")

    user = db.query(User).filter(User.id == user_id).first()
    if user and user.role != "admin":
        existing_member = db.query(TeamMember).filter(TeamMember.user_id == user_id).first()
        if existing_member:
            raise HTTPException(status_code=400, detail="Usuário já pertence a uma equipe")

    team = db.query(Team).filter(Team.id == invitation.team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Equipe não encontrada")

    current_count = _count_members(db, invitation.team_id)
    if current_count >= team.max_members:
        raise HTTPException(status_code=400, detail="A equipe atingiu o número máximo de membros")

    member = TeamMember(team_id=invitation.team_id, user_id=user_id, role="member")
    db.add(member)

    invitation.status = "accepted"
    db.commit()
    db.refresh(invitation)

    inviter = db.query(User).filter(User.id == invitation.invited_by).first()
    return {
        "id": str(invitation.id),
        "team_id": str(invitation.team_id),
        "team_name": team.name,
        "invited_by_name": inviter.name if inviter else "",
        "status": invitation.status,
        "created_at": invitation.created_at,
    }


def reject_invitation(db: Session, invitation_id: str, user_id: UUID) -> dict:
    invitation = (
        db.query(TeamInvitation)
        .filter(TeamInvitation.id == invitation_id, TeamInvitation.user_id == user_id)
        .first()
    )
    if not invitation:
        raise HTTPException(status_code=404, detail="Convite não encontrado")
    if invitation.status != "pending":
        raise HTTPException(status_code=400, detail="Convite já processado")

    team = db.query(Team).filter(Team.id == invitation.team_id).first()
    inviter = db.query(User).filter(User.id == invitation.invited_by).first()

    invitation.status = "rejected"
    db.commit()
    db.refresh(invitation)

    return {
        "id": str(invitation.id),
        "team_id": str(invitation.team_id),
        "team_name": team.name if team else "",
        "invited_by_name": inviter.name if inviter else "",
        "status": invitation.status,
        "created_at": invitation.created_at,
    }
