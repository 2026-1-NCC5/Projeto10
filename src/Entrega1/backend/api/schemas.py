from __future__ import annotations

from typing import Optional
from pydantic import BaseModel


class SessionStatus(BaseModel):
    session_id: str
    status: str  # "running" | "stopped"
    counts: dict[str, int]
    current_detection: Optional[str] = None
    current_confidence: Optional[float] = None
    elapsed_seconds: float


class DetectionRecord(BaseModel):
    label: str
    confidence: float
    timestamp: float


class SessionResult(BaseModel):
    session_id: str
    counts: dict[str, int]
    detections: list[DetectionRecord]
    elapsed_seconds: float


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
