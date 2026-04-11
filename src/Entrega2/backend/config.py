import os

from dotenv import load_dotenv


load_dotenv()

DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5433/empathic_leaders",
)

JWT_SECRET = os.environ.get("JWT_SECRET")
if not JWT_SECRET:
    raise RuntimeError("JWT_SECRET nao definido. Defina a variavel de ambiente JWT_SECRET.")

JWT_ALGORITHM = os.environ.get("JWT_ALGORITHM", "HS256")

JWT_EXPIRATION_HOURS = int(os.environ.get("JWT_EXPIRATION_HOURS", "24"))
