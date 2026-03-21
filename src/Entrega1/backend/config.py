import os
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent

_model_path_env = os.environ.get("MODEL_PATH")
MODEL_PATH = Path(_model_path_env) if _model_path_env else BACKEND_DIR / "models" / "best.pt"

CATEGORIES = ["arroz", "feijao", "outros"]

CONFIDENCE_THRESHOLD = 0.75

CAMERA_INDEX = int(os.environ.get("CAMERA_INDEX", "0"))
