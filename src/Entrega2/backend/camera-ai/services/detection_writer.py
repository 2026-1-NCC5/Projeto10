import uuid
from datetime import datetime
from typing import Optional
from uuid import UUID

from sqlalchemy import Column, DateTime, Float, Numeric, String
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import declarative_base, Session

from config import DATABASE_URL
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker


Base = declarative_base()


class AIDetection(Base):
    __tablename__ = "ai_detections"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    item_name = Column(String(50), nullable=False)
    category = Column(String(20), nullable=False)
    estimated_weight_g = Column(Numeric(10, 2), nullable=True)
    confidence = Column(Float, nullable=False)
    detected_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    team_id = Column(PGUUID(as_uuid=True), nullable=False)
    operator_name = Column(String(100), nullable=True)
    s3_key = Column(String(300), nullable=True)


_engine = create_engine(DATABASE_URL)
_SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=_engine)


def write_detection(
    item_name: str,
    category: str,
    confidence: float,
    team_id: UUID,
    operator_name: Optional[str],
    estimated_weight_g: Optional[float],
) -> UUID:
    db: Session = _SessionLocal()
    try:
        detection = AIDetection(
            item_name=item_name,
            category=category,
            confidence=confidence,
            estimated_weight_g=estimated_weight_g,
            detected_at=datetime.utcnow(),
            team_id=team_id,
            operator_name=operator_name,
        )
        db.add(detection)
        db.commit()
        db.refresh(detection)
        return detection.id
    finally:
        db.close()


def update_s3_key(detection_id: UUID, s3_key: str) -> None:
    db: Session = _SessionLocal()
    try:
        row = db.query(AIDetection).filter(AIDetection.id == detection_id).first()
        if row:
            row.s3_key = s3_key
            db.commit()
    finally:
        db.close()
