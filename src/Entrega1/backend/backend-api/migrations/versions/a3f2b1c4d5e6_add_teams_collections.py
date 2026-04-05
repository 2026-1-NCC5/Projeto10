"""add teams and collections tables

Revision ID: a3f2b1c4d5e6
Revises: e680c833651c
Create Date: 2026-04-04 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import UUID


revision: str = 'a3f2b1c4d5e6'
down_revision: Union[str, Sequence[str], None] = 'e680c833651c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "teams",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(80), nullable=False),
        sa.Column("description", sa.String(300), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
    )
    op.create_index("ix_teams_name", "teams", ["name"], unique=True)

    op.create_table(
        "team_members",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("team_id", UUID(as_uuid=True), sa.ForeignKey("teams.id", ondelete="CASCADE"), nullable=False),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("joined_at", sa.DateTime(), nullable=True),
    )
    op.create_index("ix_team_members_team", "team_members", ["team_id"])
    op.create_index("ix_team_members_user", "team_members", ["user_id"], unique=True)

    op.create_table(
        "join_requests",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("team_id", UUID(as_uuid=True), sa.ForeignKey("teams.id", ondelete="CASCADE"), nullable=False),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("status", sa.String(20), nullable=False, server_default="pending"),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.UniqueConstraint("team_id", "user_id", name="uq_join_requests_team_user"),
    )
    op.create_index("ix_join_requests_team", "join_requests", ["team_id"])
    op.create_index("ix_join_requests_user", "join_requests", ["user_id"])
    op.create_index("ix_join_requests_status", "join_requests", ["status"])

    op.create_table(
        "batches",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("team_id", UUID(as_uuid=True), sa.ForeignKey("teams.id", ondelete="SET NULL"), nullable=True),
        sa.Column("submitted_at", sa.DateTime(), nullable=True),
    )
    op.create_index("ix_batches_user", "batches", ["user_id"])
    op.create_index("ix_batches_team", "batches", ["team_id"])

    op.create_table(
        "collection_entries",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("batch_id", UUID(as_uuid=True), sa.ForeignKey("batches.id", ondelete="CASCADE"), nullable=False),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("team_id", UUID(as_uuid=True), sa.ForeignKey("teams.id", ondelete="SET NULL"), nullable=True),
        sa.Column("item_type", sa.String(20), nullable=False),
        sa.Column("item_name", sa.String(100), nullable=True),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.Column("weight", sa.Numeric(10, 2), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=True),
    )
    op.create_index("ix_collection_entries_batch", "collection_entries", ["batch_id"])
    op.create_index("ix_collection_entries_team", "collection_entries", ["team_id"])
    op.create_index("ix_collection_entries_user", "collection_entries", ["user_id"])


def downgrade() -> None:
    op.drop_index("ix_collection_entries_user", table_name="collection_entries")
    op.drop_index("ix_collection_entries_team", table_name="collection_entries")
    op.drop_index("ix_collection_entries_batch", table_name="collection_entries")
    op.drop_table("collection_entries")

    op.drop_index("ix_batches_team", table_name="batches")
    op.drop_index("ix_batches_user", table_name="batches")
    op.drop_table("batches")

    op.drop_index("ix_join_requests_status", table_name="join_requests")
    op.drop_index("ix_join_requests_user", table_name="join_requests")
    op.drop_index("ix_join_requests_team", table_name="join_requests")
    op.drop_table("join_requests")

    op.drop_index("ix_team_members_user", table_name="team_members")
    op.drop_index("ix_team_members_team", table_name="team_members")
    op.drop_table("team_members")

    op.drop_index("ix_teams_name", table_name="teams")
    op.drop_table("teams")
