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
    op.execute("DROP INDEX IF EXISTS ix_team_members_user")
    op.create_index("ix_team_members_user", "team_members", ["user_id"], unique=False)

    op.execute("""
        CREATE TABLE IF NOT EXISTS team_invitations (
            id UUID NOT NULL PRIMARY KEY,
            team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            invited_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            status VARCHAR(20) NOT NULL DEFAULT 'pending',
            created_at TIMESTAMP WITHOUT TIME ZONE
        )
    """)
    op.execute("CREATE INDEX IF NOT EXISTS ix_team_invitations_user ON team_invitations (user_id)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_team_invitations_team ON team_invitations (team_id)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_team_invitations_status ON team_invitations (status)")


def downgrade() -> None:
    op.drop_index("ix_team_invitations_status", table_name="team_invitations")
    op.drop_index("ix_team_invitations_team", table_name="team_invitations")
    op.drop_index("ix_team_invitations_user", table_name="team_invitations")
    op.drop_table("team_invitations")

    op.drop_index("ix_team_members_user", table_name="team_members")
    op.create_index("ix_team_members_user", "team_members", ["user_id"], unique=True)
