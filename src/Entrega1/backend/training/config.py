from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DATASET_BASE_DIR = BASE_DIR / "dataset_base"
DATASET_DIR = BASE_DIR / "dataset"
DATA_YAML = BASE_DIR / "data.yaml"
RUNS_DIR = BASE_DIR / "runs"
MODELS_DIR = BASE_DIR / "models"

CATEGORIES = ["arroz", "feijao", "outros"]
CLASS_MAP = {cat: i for i, cat in enumerate(CATEGORIES)}

IMG_SIZE = 640
IMAGES_PER_INPUT = 10
SPLIT_RATIO = 0.2
SEED = 42

YOLO_BASE_MODEL = "yolov8n.pt"
EPOCHS = 30
BATCH_SIZE = 8
TRAIN_NAME = "treino_alimentos"

SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}
