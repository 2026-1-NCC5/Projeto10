from typing import Literal, Optional

from pydantic import BaseModel, EmailStr


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

    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    token: str
    user: UserResponse


class HealthResponse(BaseModel):
    status: str
    database: bool
