"""normalize item names, convert weights to grams, add people/families served

Revision ID: h3i4j5k6l7m8
Revises: g2h3i4j5k6l7
Create Date: 2026-04-18 22:30:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
import unicodedata
from alembic import op


revision: str = "h3i4j5k6l7m8"
down_revision: Union[str, None] = "g2h3i4j5k6l7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _normalize(value):
    if value is None:
        return None
    stripped = str(value).strip()
    if not stripped:
        return None
    nfkd = unicodedata.normalize("NFKD", stripped)
    return "".join(ch for ch in nfkd if not unicodedata.combining(ch)).lower()


def upgrade() -> None:
    op.add_column("batches", sa.Column("people_served", sa.Integer(), nullable=True))
    op.add_column("batches", sa.Column("families_served", sa.Integer(), nullable=True))

    op.execute("UPDATE collection_entries SET weight = weight * 1000")

    conn = op.get_bind()

    rows = conn.execute(sa.text("SELECT id, item_name FROM collection_entries WHERE item_name IS NOT NULL")).fetchall()
    for row_id, item_name in rows:
        normalized = _normalize(item_name)
        if normalized is not None and normalized != item_name:
            conn.execute(
                sa.text("UPDATE collection_entries SET item_name = :n WHERE id = :id"),
                {"n": normalized, "id": row_id},
            )

    rows = conn.execute(sa.text("SELECT id, item_name FROM ai_detections")).fetchall()
    for row_id, item_name in rows:
        normalized = _normalize(item_name) or "desconhecido"
        if normalized != item_name:
            conn.execute(
                sa.text("UPDATE ai_detections SET item_name = :n WHERE id = :id"),
                {"n": normalized, "id": row_id},
            )


def downgrade() -> None:
    op.execute("UPDATE collection_entries SET weight = weight / 1000")
    op.drop_column("batches", "families_served")
    op.drop_column("batches", "people_served")
