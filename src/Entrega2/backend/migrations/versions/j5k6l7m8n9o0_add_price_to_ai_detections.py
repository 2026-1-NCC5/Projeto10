"""add estimated_price_brl to ai_detections

Revision ID: j5k6l7m8n9o0
Revises: i4j5k6l7m8n9
Create Date: 2026-05-02 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = "j5k6l7m8n9o0"
down_revision: Union[str, None] = "i4j5k6l7m8n9"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "ai_detections",
        sa.Column("estimated_price_brl", sa.Numeric(10, 2), nullable=True),
    )

    op.execute(
        sa.text("""
        UPDATE ai_detections
        SET estimated_price_brl = ROUND(
            (estimated_weight_g / 1000.0) *
            CASE item_name
                WHEN 'arroz'    THEN 5.50
                WHEN 'feijao'   THEN 7.50
                WHEN 'acucar'   THEN 4.50
                WHEN 'cafe'     THEN 70.00
                WHEN 'macarrao' THEN 8.00
                ELSE NULL
            END,
        2)
        WHERE estimated_weight_g IS NOT NULL
        """)
    )


def downgrade() -> None:
    op.drop_column("ai_detections", "estimated_price_brl")
