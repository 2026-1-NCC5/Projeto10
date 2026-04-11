"""add role to team_members and max_members to teams

Revision ID: b9c3d2e1f0a4
Revises: a3f2b1c4d5e6
Create Date: 2026-04-04 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = 'b9c3d2e1f0a4'
down_revision: Union[str, Sequence[str], None] = 'a3f2b1c4d5e6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "team_members",
        sa.Column("role", sa.String(20), nullable=False, server_default="member"),
    )
    op.add_column(
        "teams",
        sa.Column("max_members", sa.Integer(), nullable=False, server_default="30"),
    )


def downgrade() -> None:
    op.drop_column("team_members", "role")
    op.drop_column("teams", "max_members")
