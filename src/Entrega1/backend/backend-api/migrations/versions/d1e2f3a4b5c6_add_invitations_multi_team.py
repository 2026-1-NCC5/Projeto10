"""add invitations and allow admin multi-team

Revision ID: d1e2f3a4b5c6
Revises: b9c3d2e1f0a4
Create Date: 2026-04-04 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import UUID


revision: str = 'd1e2f3a4b5c6'
down_revision: Union[str, Sequence[str], None] = 'b9c3d2e1f0a4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_index("ix_team_members_user", table_name="team_members")
    op.create_index("ix_team_members_user", "team_members", ["user_id"], unique=False)

    op.create_table(
        "team_invitations",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("team_id", UUID(as_uuid=True), sa.ForeignKey("teams.id", ondelete="CASCADE"), nullable=False),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("invited_by", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("status", sa.String(20), nullable=False, server_default="pending"),
        sa.Column("created_at", sa.DateTime(), nullable=True),
    )
    op.create_index("ix_team_invitations_user", "team_invitations", ["user_id"])
    op.create_index("ix_team_invitations_team", "team_invitations", ["team_id"])
    op.create_index("ix_team_invitations_status", "team_invitations", ["status"])


def downgrade() -> None:
    op.drop_index("ix_team_invitations_status", table_name="team_invitations")
    op.drop_index("ix_team_invitations_team", table_name="team_invitations")
    op.drop_index("ix_team_invitations_user", table_name="team_invitations")
    op.drop_table("team_invitations")

    op.drop_index("ix_team_members_user", table_name="team_members")
    op.create_index("ix_team_members_user", "team_members", ["user_id"], unique=True)
