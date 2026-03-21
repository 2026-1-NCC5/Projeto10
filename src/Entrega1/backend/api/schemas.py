from __future__ import annotations

from typing import Optional

from pydantic import BaseModel


class BoundingBox(BaseModel):
    x1: float
    y1: float
    x2: float
    y2: float


class DetectionRecord(BaseModel):
    label: str
    confidence: float
    timestamp: float
    object_id: Optional[int] = None


class SessionStatus(BaseModel):
    session_id: str
    status: str  # "running" | "stopped"
    counts: dict[str, int]
    active_detections: list[DetectionRecord] = []
    tracked_objects: int = 0
    elapsed_seconds: float


class SessionResult(BaseModel):
    session_id: str
    counts: dict[str, int]
    detections: list[DetectionRecord]
    elapsed_seconds: float
    total_unique_items: int = 0


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    model_type: str = "yolov8n"
