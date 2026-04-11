import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, Float, Index, Numeric, String
from sqlalchemy.dialects.postgresql import UUID

from database import Base


class AIDetection(Base):
    __tablename__ = "ai_detections"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    item_name = Column(String(50), nullable=False)
    category = Column(String(20), nullable=False)
    estimated_weight_g = Column(Numeric(10, 2), nullable=True)
    confidence = Column(Float, nullable=False)
    detected_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    team_id = Column(UUID(as_uuid=True), nullable=False)
    operator_name = Column(String(100), nullable=True)
    s3_key = Column(String(300), nullable=True)

    __table_args__ = (
        Index("ix_ai_detections_team_detected", "team_id", "detected_at"),
    )
