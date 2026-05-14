import os
from pathlib import Path

from dotenv import load_dotenv


load_dotenv()

CAMERA_AI_DIR = Path(__file__).resolve().parent

_model_path_env = os.environ.get("MODEL_PATH")
MODEL_PATH = Path(_model_path_env) if _model_path_env else CAMERA_AI_DIR / "models" / "best.pt"

YOLO_CLASSES = ["arroz", "feijao", "acucar", "cafe", "macarrao"]

CATEGORIES = ["arroz", "feijao", "outros"]

CLASS_TO_CATEGORY = {
    "arroz": ("arroz", "arroz"),
    "feijao": ("feijao", "feijao"),
    "acucar": ("outros", "acucar"),
    "cafe": ("outros", "cafe"),
    "macarrao": ("outros", "macarrao"),
}

SUB_ITEM_DEFAULT = "desconhecido"

CONFIDENCE_THRESHOLD = float(os.environ.get("CONFIDENCE_THRESHOLD", "0.75"))

CAMERA_INDEX = int(os.environ.get("CAMERA_INDEX", "1"))

DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5433/empathic_leaders",
)

S3_ENABLED = os.environ.get("S3_ENABLED", "false").lower() == "true"
S3_BUCKET = os.environ.get("S3_BUCKET", "")
S3_REGION = os.environ.get("S3_REGION", "us-east-1")
S3_ACCESS_KEY_ID = os.environ.get("S3_ACCESS_KEY_ID", "")
S3_SECRET_ACCESS_KEY = os.environ.get("S3_SECRET_ACCESS_KEY", "")

CATEGORY_WEIGHTS_G: dict[str, float] = {
    "arroz": 1000.0,
    "feijao": 1000.0,
    "acucar": 1000.0,
    "cafe": 500.0,
    "macarrao": 500.0,
}

CATEGORY_WEIGHT_BUCKETS: dict[str, list[tuple[float, float]]] = {
    "arroz":    [(0.18, 1000.0), (0.32, 2000.0), (1.01, 5000.0)],
    "feijao":   [(0.18, 1000.0), (0.32, 2000.0), (1.01, 5000.0)],
    "acucar":   [(0.18, 1000.0), (0.32, 2000.0), (1.01, 5000.0)],
    "cafe":     [(0.10, 250.0),  (0.18, 500.0),  (1.01, 1000.0)],
    "macarrao": [(0.15, 500.0),  (1.01, 1000.0)],
}


def estimate_weight_g(raw_label: str, area_ratio: float) -> float | None:
    buckets = CATEGORY_WEIGHT_BUCKETS.get(raw_label)
    if not buckets:
        return CATEGORY_WEIGHTS_G.get(raw_label)
    for max_ratio, weight_g in buckets:
        if area_ratio <= max_ratio:
            return weight_g
    return buckets[-1][1]

CATEGORY_PRICES_BRL_PER_KG: dict[str, float] = {
    "arroz": 5.50,
    "feijao": 7.50,
    "acucar": 4.50,
    "cafe": 50.00,
    "macarrao": 8.00,
}

MAX_DISAPPEARED_FRAMES = int(os.environ.get("MAX_DISAPPEARED_FRAMES", "15"))

VIRTUAL_LINE_Y_RATIO = float(os.environ.get("VIRTUAL_LINE_Y_RATIO", "0.5"))

LINE_COUNT_DIRECTION = os.environ.get("LINE_COUNT_DIRECTION", "down")

STABILITY_WINDOW = int(os.environ.get("STABILITY_WINDOW", "12"))

STABILITY_MAJORITY = int(os.environ.get("STABILITY_MAJORITY", "8"))

STABILITY_MEAN_CONFIDENCE = float(os.environ.get("STABILITY_MEAN_CONFIDENCE", "0.80"))

STRICT_CONFIDENCE_NO_OCR = float(os.environ.get("STRICT_CONFIDENCE_NO_OCR", "0.90"))

RECOUNT_COOLDOWN_S = float(os.environ.get("RECOUNT_COOLDOWN_S", "4.0"))
