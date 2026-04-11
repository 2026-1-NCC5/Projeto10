from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from api.dependencies import get_db
from api.schemas import RegisterRequest, LoginRequest, AuthResponse, UserResponse
from services.auth_service import hash_password, verify_password, create_token, validate_password_rules
from services.user_service import create_user, get_user_by_email


router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=AuthResponse)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    if not body.name or not body.name.strip():
        raise HTTPException(status_code=422, detail="Nome é obrigatório")

    if len(body.name) > 100:
        raise HTTPException(status_code=422, detail="Nome deve ter no máximo 100 caracteres")

    if len(body.email) > 255:
        raise HTTPException(status_code=422, detail="Email deve ter no máximo 255 caracteres")

    password_errors = validate_password_rules(body.password)
    if password_errors:
        raise HTTPException(status_code=422, detail=password_errors[0])

    hashed = hash_password(body.password)
    user = create_user(db, body.name.strip(), body.email, hashed)

    token = create_token({"sub": str(user.id)})
    return AuthResponse(
        token=token,
        user=UserResponse(
            id=str(user.id),
            name=user.name,
            email=user.email,
            role=user.role,
        ),
    )


@router.post("/login", response_model=AuthResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = get_user_by_email(db, body.email)
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Credenciais inválidas")

    token = create_token({"sub": str(user.id)})
    return AuthResponse(
        token=token,
        user=UserResponse(
            id=str(user.id),
            name=user.name,
            email=user.email,
            role=user.role,
        ),
    )
