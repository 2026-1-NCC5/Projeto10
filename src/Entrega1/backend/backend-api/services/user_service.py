from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from models.team import TeamMember
from models.user import User


def create_user(db: Session, name: str, email: str, hashed_password: str) -> User:
    user = User(name=name, email=email, hashed_password=hashed_password)
    db.add(user)
    try:
        db.commit()
        db.refresh(user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Email já cadastrado")
    return user


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email).first()


def get_all_users(db: Session, available_only: bool = False) -> list[dict]:
    query = db.query(User, TeamMember).outerjoin(TeamMember, TeamMember.user_id == User.id)
    if available_only:
        query = query.filter(TeamMember.id == None)
    rows = query.all()
    return [
        {
            "id": str(u.id),
            "name": u.name,
            "email": u.email,
            "role": u.role,
            "team_id": str(tm.team_id) if tm else None,
        }
        for u, tm in rows
    ]


def update_user_role(db: Session, user_id: UUID, role: str) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    if user.role is not None:
        raise HTTPException(status_code=400, detail="Papel já definido")
    user.role = role
    db.commit()
    db.refresh(user)
    return user
