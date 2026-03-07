import cv2
import numpy as np
from PIL import Image


def extract_roi(image_bgr, padding=10):
    """Extrai a região de interesse (embalagem) usando limiarização de Otsu.

    Retorna a imagem recortada (BGR) ou a imagem original se nenhum contorno for encontrado.
    """
    gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    _, thresh = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    if not contours:
        return image_bgr

    largest = max(contours, key=cv2.contourArea)
    x, y, w, h = cv2.boundingRect(largest)

    img_h, img_w = image_bgr.shape[:2]
    x1 = max(0, x - padding)
    y1 = max(0, y - padding)
    x2 = min(img_w, x + w + padding)
    y2 = min(img_h, y + h + padding)

    return image_bgr[y1:y2, x1:x2]


def preprocess_image(image_path):
    """Carrega uma imagem, extrai ROI e retorna como PIL Image (RGB)."""
    img_bgr = cv2.imread(str(image_path))
    if img_bgr is None:
        return None
    roi = extract_roi(img_bgr)
    roi_rgb = cv2.cvtColor(roi, cv2.COLOR_BGR2RGB)
    return Image.fromarray(roi_rgb)


def preprocess_frame(frame_bgr):
    """Extrai ROI de um frame BGR e retorna como PIL Image (RGB)."""
    roi = extract_roi(frame_bgr)
    roi_rgb = cv2.cvtColor(roi, cv2.COLOR_BGR2RGB)
    return Image.fromarray(roi_rgb)


def detect_object_present(frame_bgr, min_area_ratio=0.02):
    """Detecta se há um objeto significativo no frame usando contornos.

    Retorna (presente: bool, bounding_box: tuple ou None).
    """
    gray = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    _, thresh = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not contours:
        return False, None

    largest = max(contours, key=cv2.contourArea)
    area = cv2.contourArea(largest)
    frame_area = frame_bgr.shape[0] * frame_bgr.shape[1]

    if area / frame_area < min_area_ratio:
        return False, None

    return True, cv2.boundingRect(largest)
