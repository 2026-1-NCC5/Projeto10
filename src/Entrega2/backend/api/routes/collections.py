from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from api.dependencies import get_current_user, get_db, require_admin_or_coordinator
from api.schemas import (
    BatchResponse,
    CollectionEntryResponse,
    CollectionSummaryResponse,
    SubmitBatchRequest,
)
from models.user import User
from services.collection_service import (
    get_team_collections,
    get_team_summary,
    get_user_collections,
    submit_batch,
)
from services.team_service import get_team_member


router = APIRouter(prefix="/api/collections", tags=["collections"])


@router.get("/me", response_model=list[CollectionEntryResponse])
def get_my_collections(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return get_user_collections(db, current_user.id)


@router.get("/team/{team_id}", response_model=list[CollectionEntryResponse])
def get_team_history(
    team_id: str,
    current_user: User = Depends(require_admin_or_coordinator),
    db: Session = Depends(get_db),
):
    return get_team_collections(db, team_id)


@router.get("/team/{team_id}/summary", response_model=CollectionSummaryResponse)
def get_summary(
    team_id: str,
    current_user: User = Depends(require_admin_or_coordinator),
    db: Session = Depends(get_db),
):
    return get_team_summary(db, team_id)


@router.post("/batch", response_model=BatchResponse, status_code=status.HTTP_201_CREATED)
def submit_collection_batch(
    body: SubmitBatchRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    membership = get_team_member(db, current_user.id)
    team_id = str(membership.team_id) if membership else None
    items = [item.model_dump() for item in body.items]
    batch_id = submit_batch(db, current_user.id, team_id, items)
    return {"batch_id": batch_id}
