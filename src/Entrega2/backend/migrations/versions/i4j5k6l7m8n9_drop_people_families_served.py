"""drop people_served and families_served from batches

Revision ID: i4j5k6l7m8n9
Revises: h3i4j5k6l7m8
Create Date: 2026-04-18 23:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = "i4j5k6l7m8n9"
down_revision: Union[str, None] = "h3i4j5k6l7m8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_column("batches", "families_served")
    op.drop_column("batches", "people_served")


def downgrade() -> None:
    op.add_column("batches", sa.Column("people_served", sa.Integer(), nullable=True))
    op.add_column("batches", sa.Column("families_served", sa.Integer(), nullable=True))
