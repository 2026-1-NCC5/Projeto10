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


class TeamResponse(CamelModel):
    id: str
    name: str
    description: Optional[str] = None
    max_members: int = 30
    members: list[TeamMemberResponse] = []


class CreateTeamRequest(BaseModel):
    name: str
    description: Optional[str] = None
    coordinator_ids: list[str] = []
    member_ids: list[str] = []


class TeamUpdateRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class TeamValidationResponse(CamelModel):
    valid: bool
    issues: list[str] = []


class AddTeamMemberRequest(BaseModel):
    user_id: str


class ReallocateMemberRequest(BaseModel):
    user_id: str


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


class AIDetectionResponse(CamelModel):
    id: str
    item_name: str
    category: str
    estimated_weight_g: Optional[float] = None
    confidence: float
    detected_at: datetime
    team_id: str
    operator_name: Optional[str] = None
    s3_key: Optional[str] = None
    image_url: Optional[str] = None


class DashboardCategoryTotal(CamelModel):
    category: str
    total_weight_g: float
    count: int


class DashboardTimeseriesPoint(CamelModel):
    date: str
    total_weight_g: float
    count: int


class DashboardSummaryResponse(CamelModel):
    team_id: str
    team_name: Optional[str] = None
    totals: dict[str, float]
    counts_by_category: list[DashboardCategoryTotal]
    timeseries: list[DashboardTimeseriesPoint]


class DashboardTeamSummary(CamelModel):
    team_id: str
    team_name: str
    total_weight_g: float
    total_count: int
    by_category: list[DashboardCategoryTotal]


class DashboardAllSummaryResponse(CamelModel):
    teams: list[DashboardTeamSummary]


class ComparisonEvidence(CamelModel):
    detection_id: str
    image_url: Optional[str] = None
    detected_at: datetime
    confidence: float


class ComparisonCategory(CamelModel):
    category: str
    manual_count: int
    manual_weight_g: float
    ai_count: int
    ai_weight_g: float
    match: bool
    evidence: list[ComparisonEvidence] = []


class DashboardComparisonResponse(CamelModel):
    team_id: str
    categories: list[ComparisonCategory]
