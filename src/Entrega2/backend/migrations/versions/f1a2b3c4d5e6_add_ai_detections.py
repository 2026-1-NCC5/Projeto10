"""add ai_detections table

Revision ID: f1a2b3c4d5e6
Revises: d1e2f3a4b5c6
Create Date: 2026-04-11 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "f1a2b3c4d5e6"
down_revision: Union[str, None] = "d1e2f3a4b5c6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "ai_detections",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("item_name", sa.String(50), nullable=False),
        sa.Column("category", sa.String(20), nullable=False),
        sa.Column("estimated_weight_g", sa.Numeric(10, 2), nullable=True),
        sa.Column("confidence", sa.Float, nullable=False),
        sa.Column("detected_at", sa.DateTime, nullable=False),
        sa.Column("team_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("operator_name", sa.String(100), nullable=True),
        sa.Column("s3_key", sa.String(300), nullable=True),
    )
    op.create_index(
        "ix_ai_detections_team_detected",
        "ai_detections",
        ["team_id", "detected_at"],
    )


def downgrade() -> None:
    op.drop_index("ix_ai_detections_team_detected", table_name="ai_detections")
    op.drop_table("ai_detections")
