from datetime import datetime
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from models.team import Batch, CollectionEntry
from models.user import User


def get_user_collections(db: Session, user_id: UUID) -> list[dict]:
    rows = (
        db.query(CollectionEntry, User)
        .join(User, User.id == CollectionEntry.user_id)
        .filter(CollectionEntry.user_id == user_id)
        .order_by(CollectionEntry.created_at.desc())
        .all()
    )
    return [_entry_to_dict(entry, user) for entry, user in rows]


def get_team_collections(db: Session, team_id: str) -> list[dict]:
    rows = (
        db.query(CollectionEntry, User)
        .join(User, User.id == CollectionEntry.user_id)
        .filter(CollectionEntry.team_id == team_id)
        .order_by(CollectionEntry.created_at.desc())
        .all()
    )
    return [_entry_to_dict(entry, user) for entry, user in rows]


def get_team_summary(db: Session, team_id: str) -> dict:
    now = datetime.utcnow()

    total_collected = (
        db.query(func.count(CollectionEntry.id))
        .filter(CollectionEntry.team_id == team_id)
        .scalar()
        or 0
    )

    total_weight = (
        db.query(func.sum(CollectionEntry.weight))
        .filter(CollectionEntry.team_id == team_id)
        .scalar()
        or 0
    )

    collected_this_month = (
        db.query(func.count(CollectionEntry.id))
        .filter(
            CollectionEntry.team_id == team_id,
            func.extract("year", CollectionEntry.created_at) == now.year,
            func.extract("month", CollectionEntry.created_at) == now.month,
        )
        .scalar()
        or 0
    )

    return {
        "total_collected": total_collected,
        "total_weight": float(total_weight),
        "collected_this_month": collected_this_month,
    }


def submit_batch(db: Session, user_id: UUID, team_id: str | None, items: list[dict]) -> str:
    for item in items:
        if item["item_type"] == "Outros" and not item.get("item_name"):
            raise HTTPException(
                status_code=422,
                detail="item_name é obrigatório para o tipo Outros",
            )

    batch = Batch(user_id=user_id, team_id=team_id)
    db.add(batch)
    db.flush()

    for item in items:
        entry = CollectionEntry(
            batch_id=batch.id,
            user_id=user_id,
            team_id=team_id,
            item_type=item["item_type"],
            item_name=item.get("item_name"),
            quantity=item["quantity"],
            weight=item["weight"],
        )
        db.add(entry)

    db.commit()
    db.refresh(batch)
    return str(batch.id)


def _entry_to_dict(entry: CollectionEntry, user: User) -> dict:
    return {
        "id": str(entry.id),
        "item_type": entry.item_type,
        "item_name": entry.item_name,
        "quantity": entry.quantity,
        "weight": float(entry.weight),
        "added_by": user.name,
        "added_at": entry.created_at,
        "team_id": str(entry.team_id) if entry.team_id else None,
    }
