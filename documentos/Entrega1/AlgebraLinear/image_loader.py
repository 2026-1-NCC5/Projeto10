from pathlib import Path
from PIL import Image

SUPPORTED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".bmp"}


def find_image(directory):
    directory = Path(directory)
    if not directory.is_dir():
        return None
    for file in sorted(directory.iterdir()):
        if file.suffix.lower() in SUPPORTED_EXTENSIONS:
            return file
    return None


def load_and_resize(image_path, size=(50, 50)):
    image = Image.open(image_path).convert("RGB")
    return image.resize(size)
