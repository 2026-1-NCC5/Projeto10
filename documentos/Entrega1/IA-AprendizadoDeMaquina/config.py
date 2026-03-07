from pathlib import Path

import torch

NOTEBOOK_DIR = Path(__file__).resolve().parent
DATASET_DIR = NOTEBOOK_DIR / "dataset"
MODELS_DIR = NOTEBOOK_DIR / "models"
BEST_MODEL_PATH = MODELS_DIR / "best_food_classifier.pth"

CATEGORIES = ["arroz", "feijao", "outros"]
IMG_SIZE = 224
BATCH_SIZE = 16
EPOCHS = 15
LR = 1e-4
VALIDATION_SPLIT = 0.2
SEED = 42

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
SUPPORTED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".bmp", ".webp"}

IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]
