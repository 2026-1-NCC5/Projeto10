from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, EmailStr
from pydantic.alias_generators import to_camel


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RoleUpdateRequest(BaseModel):
    role: Literal["operator", "coordinator", "admin"]


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: Optional[str] = None
    team_id: Optional[str] = None

    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    token: str
    user: UserResponse


class HealthResponse(BaseModel):
    status: str
    database: bool


class CamelModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )


class TeamMemberResponse(CamelModel):
    id: str
    name: str
    email: str
    role: Optional[str] = None
    team_role: Optional[str] = None


class TeamResponse(CamelModel):
    id: str
    name: str
    description: Optional[str] = None
    max_members: int = 30
    members: list[TeamMemberResponse] = []


class CreateTeamRequest(BaseModel):
    name: str
    description: Optional[str] = None
    max_members: int = 30
    leader_id: Optional[str] = None


class AddTeamMemberRequest(BaseModel):
    user_id: str
    role: Literal["member", "leader"] = "member"


class JoinRequestResponse(CamelModel):
    id: str
    user_id: str
    user_name: str
    team_id: str
    status: str
    created_at: datetime


class UpdateJoinRequestRequest(BaseModel):
    status: Literal["approved", "rejected"]


class CollectionItemInput(BaseModel):
    item_type: Literal["Arroz", "Feijao", "Outros"]
    item_name: Optional[str] = None
    quantity: int
    weight: float


class CollectionEntryResponse(CamelModel):
    id: str
    item_type: str
    item_name: Optional[str] = None
    quantity: int
    weight: float
    added_by: str
    added_at: datetime
    team_id: Optional[str] = None


class CollectionSummaryResponse(CamelModel):
    total_collected: int
    total_weight: float
    collected_this_month: int


class BatchResponse(CamelModel):
    batch_id: str


class SubmitBatchRequest(BaseModel):
    items: list[CollectionItemInput]


class UserListResponse(CamelModel):
    id: str
    name: str
    email: str
    role: Optional[str] = None
    team_id: Optional[str] = None


class SendInvitationRequest(BaseModel):
    user_id: str


class TeamInvitationResponse(CamelModel):
    id: str
    team_id: str
    team_name: str
    invited_by_name: str
    status: str
    created_at: datetime
