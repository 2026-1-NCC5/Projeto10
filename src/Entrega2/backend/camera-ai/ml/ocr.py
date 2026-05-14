import re
import threading
import unicodedata

import cv2


try:
    import easyocr
    _OCR_IMPORTED = True
except ImportError:
    easyocr = None
    _OCR_IMPORTED = False


_PRODUCT_KEYWORDS = {
    "arroz": "arroz",
    "feijao": "feijao",
    "acucar": "acucar",
    "assucar": "acucar",
    "cafe": "cafe",
    "macarrao": "macarrao",
    "espaguete": "macarrao",
    "spaghetti": "macarrao",
    "penne": "macarrao",
    "parafuso": "macarrao",
}

_WEIGHT_RE = re.compile(
    r"(\d+(?:[\.,]\d+)?)\s*(kg|k9|k0|ko|kq|kilo[s]?|quilo[s]?|gramas?|gr|g)\b",
    re.IGNORECASE,
)


def _normalize_unit(unit: str) -> str:
    unit = unit.lower()
    if unit in ("k9", "k0", "ko", "kq") or unit.startswith("kil") or unit.startswith("qui"):
        return "kg"
    if unit.startswith("g"):
        return "g"
    return unit


_reader = None
_reader_lock = threading.Lock()
_init_failed = False


def _get_reader():
    global _reader, _init_failed
    if _init_failed or not _OCR_IMPORTED:
        return None
    if _reader is not None:
        return _reader
    with _reader_lock:
        if _reader is not None:
            return _reader
        try:
            print("[OCR] Inicializando EasyOCR (primeira vez baixa ~64MB)...")
            _reader = easyocr.Reader(["pt", "en"], gpu=False, verbose=False)
            print("[OCR] EasyOCR pronto.")
        except Exception as exc:
            print(f"[OCR] falha ao inicializar: {exc}")
            _init_failed = True
            return None
    return _reader


def is_available() -> bool:
    return _get_reader() is not None


def _strip_accents(text: str) -> str:
    nfkd = unicodedata.normalize("NFKD", text)
    return "".join(ch for ch in nfkd if not unicodedata.combining(ch)).lower()


def _preprocess(crop_bgr):
    if crop_bgr is None or crop_bgr.size == 0:
        return None
    h, w = crop_bgr.shape[:2]
    if h < 200 or w < 200:
        scale = max(2.0, 400.0 / max(h, w))
        crop_bgr = cv2.resize(
            crop_bgr, (int(w * scale), int(h * scale)),
            interpolation=cv2.INTER_CUBIC,
        )
    return crop_bgr


def _parse_weight(text_lower: str) -> float | None:
    candidates: list[float] = []
    for match in _WEIGHT_RE.finditer(text_lower):
        raw_value, unit_raw = match.group(1), match.group(2)
        unit = _normalize_unit(unit_raw)
        try:
            value = float(raw_value.replace(",", "."))
        except ValueError:
            continue
        if unit == "kg":
            grams = value * 1000.0
        else:
            grams = value
        if 100.0 <= grams <= 10000.0:
            candidates.append(grams)
    if not candidates:
        return None
    return max(candidates)


def _parse_product(text_lower: str) -> str | None:
    for keyword, label in _PRODUCT_KEYWORDS.items():
        if keyword in text_lower:
            return label
    return None


def read_label(crop_bgr) -> tuple[str | None, float | None, str]:
    reader = _get_reader()
    if reader is None:
        return None, None, ""
    processed = _preprocess(crop_bgr)
    if processed is None:
        return None, None, ""
    try:
        results = reader.readtext(processed, detail=0, paragraph=False)
    except Exception as exc:
        print(f"[OCR] erro: {exc}")
        return None, None, ""
    raw_text = " ".join(results) if results else ""
    text_lower = _strip_accents(raw_text)
    product = _parse_product(text_lower)
    weight = _parse_weight(text_lower)
    return product, weight, raw_text.strip()
