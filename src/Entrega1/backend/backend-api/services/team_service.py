from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from models.team import JoinRequest, Team, TeamMember
from models.user import User


def _count_members(db: Session, team_id: UUID) -> int:
    return (
        db.query(func.count(TeamMember.id))
        .filter(TeamMember.team_id == team_id)
        .scalar()
        or 0
    )


def get_all_teams(db: Session) -> list[dict]:
    teams = db.query(Team).all()
    result = []
    for team in teams:
        member_rows = (
            db.query(User, TeamMember)
            .join(TeamMember, TeamMember.user_id == User.id)
            .filter(TeamMember.team_id == team.id)
            .all()
        )
        members = [
            {
                "id": str(u.id),
                "name": u.name,
                "email": u.email,
                "role": u.role,
                "team_role": tm.role,
            }
            for u, tm in member_rows
        ]
        result.append(
            {
                "id": str(team.id),
                "name": team.name,
                "description": team.description,
                "max_members": team.max_members,
                "members": members,
            }
        )
    return result


def create_team(
    db: Session,
    name: str,
    description: str | None,
    max_members: int,
    leader_id: str | None,
    creator_id: UUID,
) -> Team:
    team = Team(name=name, description=description, max_members=max_members)
    db.add(team)
    try:
        db.commit()
        db.refresh(team)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Nome de equipe já utilizado")

    resolved_leader_id = UUID(leader_id) if leader_id else creator_id

    leader = db.query(User).filter(User.id == resolved_leader_id).first()
    if not leader:
        db.delete(team)
        db.commit()
        raise HTTPException(status_code=404, detail="Líder não encontrado")

    if leader.role not in ("admin", "coordinator"):
        db.delete(team)
        db.commit()
        raise HTTPException(
            status_code=400,
            detail="Somente administradores ou coordenadores podem ser líderes",
        )

    if leader.role != "admin":
        existing_membership = (
            db.query(TeamMember).filter(TeamMember.user_id == resolved_leader_id).first()
        )
        if existing_membership:
            db.delete(team)
            db.commit()
            raise HTTPException(status_code=400, detail="Usuário já pertence a uma equipe")

    leader_member = TeamMember(team_id=team.id, user_id=resolved_leader_id, role="leader")
    db.add(leader_member)
    db.commit()
    return team


def get_team_member(db: Session, user_id: UUID) -> TeamMember | None:
    return db.query(TeamMember).filter(TeamMember.user_id == user_id).first()


def create_join_request(db: Session, team_id: str, user_id: UUID) -> JoinRequest:
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Equipe não encontrada")

    existing_member = db.query(TeamMember).filter(TeamMember.user_id == user_id).first()
    if existing_member:
        raise HTTPException(status_code=400, detail="Usuário já pertence a uma equipe")

    existing_request = (
        db.query(JoinRequest)
        .filter(JoinRequest.team_id == team_id, JoinRequest.user_id == user_id)
        .first()
    )
    if existing_request:
        raise HTTPException(status_code=400, detail="Solicitação já enviada")

    join_request = JoinRequest(team_id=team_id, user_id=user_id, status="pending")
    db.add(join_request)
    db.commit()
    db.refresh(join_request)
    return join_request


def get_join_requests(db: Session, team_id: str) -> list[dict]:
    rows = (
        db.query(JoinRequest, User)
        .join(User, User.id == JoinRequest.user_id)
        .filter(JoinRequest.team_id == team_id)
        .all()
    )
    return [
        {
            "id": str(req.id),
            "user_id": str(req.user_id),
            "user_name": user.name,
            "team_id": str(req.team_id),
            "status": req.status,
            "created_at": req.created_at,
        }
        for req, user in rows
    ]


def update_join_request(db: Session, team_id: str, request_id: str, new_status: str) -> dict:
    join_request = (
        db.query(JoinRequest)
        .filter(JoinRequest.id == request_id, JoinRequest.team_id == team_id)
        .first()
    )
    if not join_request:
        raise HTTPException(status_code=404, detail="Solicitação não encontrada")
    if join_request.status != "pending":
        raise HTTPException(status_code=400, detail="Solicitação já processada")

    join_request.status = new_status

    if new_status == "approved":
        requester = db.query(User).filter(User.id == join_request.user_id).first()
        if not requester or requester.role != "admin":
            existing_member = (
                db.query(TeamMember).filter(TeamMember.user_id == join_request.user_id).first()
            )
            if existing_member:
                raise HTTPException(status_code=400, detail="Usuário já pertence a uma equipe")

        team = db.query(Team).filter(Team.id == join_request.team_id).first()
        current_count = _count_members(db, join_request.team_id)
        if current_count >= team.max_members:
            raise HTTPException(
                status_code=400,
                detail="A equipe atingiu o número máximo de membros",
            )

        member = TeamMember(
            team_id=join_request.team_id,
            user_id=join_request.user_id,
            role="member",
        )
        db.add(member)

    db.commit()
    db.refresh(join_request)

    user = db.query(User).filter(User.id == join_request.user_id).first()
    return {
        "id": str(join_request.id),
        "user_id": str(join_request.user_id),
        "user_name": user.name if user else "",
        "team_id": str(join_request.team_id),
        "status": join_request.status,
        "created_at": join_request.created_at,
    }


def add_member_to_team(db: Session, team_id: str, user_id: str, role: str) -> dict:
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Equipe não encontrada")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    if user.role != "admin":
        existing = db.query(TeamMember).filter(TeamMember.user_id == user_id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Usuário já pertence a uma equipe")

    current_count = _count_members(db, team.id)
    if current_count >= team.max_members:
        raise HTTPException(
            status_code=400,
            detail="A equipe atingiu o número máximo de membros",
        )

    if role == "leader":
        existing_leader = (
            db.query(TeamMember)
            .filter(TeamMember.team_id == team_id, TeamMember.role == "leader")
            .first()
        )
        if existing_leader:
            raise HTTPException(status_code=400, detail="A equipe já possui um líder")

    member = TeamMember(team_id=team_id, user_id=user_id, role=role)
    db.add(member)
    db.commit()
    db.refresh(member)

    return {
        "id": str(user.id),
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "team_role": member.role,
    }


def remove_member_from_team(db: Session, team_id: str, user_id: str) -> None:
    member = (
        db.query(TeamMember)
        .filter(TeamMember.team_id == team_id, TeamMember.user_id == user_id)
        .first()
    )
    if not member:
        raise HTTPException(status_code=404, detail="Membro não encontrado na equipe")
    if member.role == "leader":
        raise HTTPException(status_code=400, detail="Não é possível remover o líder da equipe")
    db.delete(member)
    db.commit()
