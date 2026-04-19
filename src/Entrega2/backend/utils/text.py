import unicodedata
from typing import Optional


def normalize_item_name(value: Optional[str]) -> Optional[str]:
    if value is None:
        return None
    stripped = value.strip()
    if not stripped:
        return None
    nfkd = unicodedata.normalize("NFKD", stripped)
    no_accents = "".join(ch for ch in nfkd if not unicodedata.combining(ch))
    return no_accents.lower()
