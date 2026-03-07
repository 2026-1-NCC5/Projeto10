import os
from pathlib import Path

import torch

BACKEND_DIR = Path(__file__).resolve().parent

_model_path_env = os.environ.get("MODEL_PATH")
MODEL_PATH = Path(_model_path_env) if _model_path_env else BACKEND_DIR / "models" / "best_food_classifier.pth"

CATEGORIES = ["arroz", "feijao", "outros"]
IMG_SIZE = 224

IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

CONFIDENCE_THRESHOLD = 0.6
COOLDOWN_SECONDS = 2.0
