import re
from datetime import datetime, timedelta

from jose import jwt
from passlib.context import CryptContext

from config import JWT_SECRET, JWT_ALGORITHM, JWT_EXPIRATION_HOURS


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    to_encode["exp"] = expire
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)


def validate_password_rules(password: str) -> list[str]:
    errors = []

    if len(password) < 8:
        errors.append("Senha deve ter no mínimo 8 caracteres")

    if len(password) > 128:
        errors.append("Senha deve ter no máximo 128 caracteres")

    if not re.search(r"[A-Z]", password):
        errors.append("Senha deve conter uma letra maiúscula")

    if not re.search(r"[a-z]", password):
        errors.append("Senha deve conter uma letra minúscula")

    if not re.search(r"\d", password):
        errors.append("Senha deve conter um número")

    if not re.search(r"[^A-Za-z0-9]", password):
        errors.append("Senha deve conter um caractere especial")

    return errors
