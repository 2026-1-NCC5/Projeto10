from pathlib import Path

from ultralytics import YOLO

from config import MODEL_PATH


def load_model(path=None):
    """Carrega modelo YOLOv8. Retorna None se o arquivo nao existir."""
    path = Path(path) if path else MODEL_PATH

    if not path.exists():
        return None

    return YOLO(str(path))
