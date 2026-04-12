from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from models.team import Team, TeamMember
from models.user import User


def _user_has_team(db: Session, user_id) -> bool:
    return (
        db.query(TeamMember).filter(TeamMember.user_id == user_id).first() is not None
    )


def _team_to_dict(db: Session, team: Team) -> dict:
    member_rows = (
        db.query(User)
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
        }
        for u in member_rows
    ]
    return {
        "id": str(team.id),
        "name": team.name,
        "description": team.description,
        "max_members": team.max_members,
        "members": members,
    }


def get_all_teams(db: Session) -> list[dict]:
    return [_team_to_dict(db, team) for team in db.query(Team).all()]


def get_team_by_id(db: Session, team_id: str) -> dict:
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Equipe não encontrada")
    return _team_to_dict(db, team)


def get_team_member(db: Session, user_id: UUID) -> TeamMember | None:
    return db.query(TeamMember).filter(TeamMember.user_id == user_id).first()


def validate_team_invariant(db: Session, team_id: str) -> dict:
    members = (
        db.query(User)
        .join(TeamMember, TeamMember.user_id == User.id)
        .filter(TeamMember.team_id == team_id)
        .all()
    )
    issues: list[str] = []
    coord_count = sum(1 for u in members if u.role == "coordinator")
    if coord_count < 1:
        issues.append("A equipe precisa de pelo menos um coordenador")
    if len(members) < 2:
        issues.append("A equipe precisa de pelo menos dois membros no total")
    return {"valid": len(issues) == 0, "issues": issues}


def create_team(
    db: Session,
    name: str,
    description: str | None,
    coordinator_ids: list[str],
    member_ids: list[str],
) -> dict:
    if len(coordinator_ids) < 1:
        raise HTTPException(
            status_code=400, detail="A equipe precisa de pelo menos um coordenador"
        )

    all_ids = list({*coordinator_ids, *member_ids})
    if len(all_ids) < 2:
        raise HTTPException(
            status_code=400,
            detail="A equipe precisa de pelo menos dois membros no total",
        )

    users = db.query(User).filter(User.id.in_(all_ids)).all()
    users_by_id = {str(u.id): u for u in users}
    if len(users_by_id) != len(all_ids):
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    for coord_id in coordinator_ids:
        u = users_by_id[str(coord_id)]
        if u.role != "coordinator":
            raise HTTPException(
                status_code=400,
                detail=f"Usuário {u.name} não é coordenador",
            )

    for uid in all_ids:
        if _user_has_team(db, uid):
            raise HTTPException(
                status_code=400,
                detail=f"Usuário {users_by_id[str(uid)].name} já pertence a uma equipe",
            )

    team = Team(name=name, description=description)
    db.add(team)
    try:
        db.flush()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Nome de equipe já utilizado")

    for uid in all_ids:
        db.add(TeamMember(team_id=team.id, user_id=uid))

    db.commit()
    db.refresh(team)
    return _team_to_dict(db, team)


def update_team(
    db: Session,
    team_id: str,
    name: str | None = None,
    description: str | None = None,
) -> dict:
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Equipe não encontrada")

    if name is not None:
        clean = name.strip()
        if not clean:
            raise HTTPException(status_code=422, detail="Nome não pode ser vazio")
        team.name = clean
    if description is not None:
        team.description = description

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Nome de equipe já utilizado")
    db.refresh(team)
    return _team_to_dict(db, team)


def delete_team(db: Session, team_id: str) -> None:
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Equipe não encontrada")
    db.query(TeamMember).filter(TeamMember.team_id == team_id).delete()
    db.delete(team)
    db.commit()


def add_member_to_team(db: Session, team_id: str, user_id: str) -> dict:
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Equipe não encontrada")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    if _user_has_team(db, user_id):
        raise HTTPException(status_code=400, detail="Usuário já pertence a uma equipe")

    member = TeamMember(team_id=team_id, user_id=user_id)
    db.add(member)
    db.commit()

    return {
        "id": str(user.id),
        "name": user.name,
        "email": user.email,
        "role": user.role,
    }


def remove_member_from_team(db: Session, team_id: str, user_id: str) -> None:
    member = (
        db.query(TeamMember)
        .filter(TeamMember.team_id == team_id, TeamMember.user_id == user_id)
        .first()
    )
    if not member:
        raise HTTPException(status_code=404, detail="Membro não encontrado na equipe")
    db.delete(member)
    db.flush()
    _enforce_team_constraints(db, team_id)
    db.commit()


def _enforce_team_constraints(db: Session, team_id: str) -> None:
    result = validate_team_invariant(db, team_id)
    if not result["valid"]:
        db.rollback()
        raise HTTPException(status_code=400, detail="; ".join(result["issues"]))


def reallocate_member(db: Session, target_team_id: str, user_id: str) -> dict:
    target = db.query(Team).filter(Team.id == target_team_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="Equipe destino não encontrada")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    current = (
        db.query(TeamMember).filter(TeamMember.user_id == user_id).first()
    )
    if current:
        if str(current.team_id) == str(target_team_id):
            raise HTTPException(
                status_code=400, detail="Usuário já pertence à equipe destino"
            )
        db.delete(current)
        db.flush()

    db.add(TeamMember(team_id=target_team_id, user_id=user_id))
    db.commit()

    return {
        "id": str(user.id),
        "name": user.name,
        "email": user.email,
        "role": user.role,
    }
