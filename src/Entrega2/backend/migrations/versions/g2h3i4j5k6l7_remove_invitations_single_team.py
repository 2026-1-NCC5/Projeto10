"""remove invitations and enforce single team per user

Revision ID: g2h3i4j5k6l7
Revises: f1a2b3c4d5e6
Create Date: 2026-04-11 12:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import UUID


revision: str = "g2h3i4j5k6l7"
down_revision: Union[str, None] = "f1a2b3c4d5e6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        """
        DELETE FROM team_members
        WHERE id IN (
            SELECT id FROM (
                SELECT id,
                       ROW_NUMBER() OVER (
                           PARTITION BY user_id
                           ORDER BY joined_at ASC, id ASC
                       ) AS rn
                FROM team_members
            ) t
            WHERE t.rn > 1
        )
        """
    )

    op.execute("DROP INDEX IF EXISTS ix_team_invitations_status")
    op.execute("DROP INDEX IF EXISTS ix_team_invitations_team")
    op.execute("DROP INDEX IF EXISTS ix_team_invitations_user")
    op.execute("DROP TABLE IF EXISTS team_invitations")

    op.execute("DROP INDEX IF EXISTS ix_join_requests_status")
    op.execute("DROP INDEX IF EXISTS ix_join_requests_user")
    op.execute("DROP INDEX IF EXISTS ix_join_requests_team")
    op.execute("DROP TABLE IF EXISTS join_requests")

    op.execute(
        "ALTER TABLE team_members DROP COLUMN IF EXISTS role"
    )

    op.execute("DROP INDEX IF EXISTS ix_team_members_user")
    op.create_index(
        "ix_team_members_user", "team_members", ["user_id"], unique=True
    )


def downgrade() -> None:
    op.drop_index("ix_team_members_user", table_name="team_members")
    op.create_index(
        "ix_team_members_user", "team_members", ["user_id"], unique=False
    )

    op.add_column(
        "team_members",
        sa.Column("role", sa.String(20), nullable=False, server_default="member"),
    )

    op.create_table(
        "join_requests",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "team_id",
            UUID(as_uuid=True),
            sa.ForeignKey("teams.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "user_id",
            UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("status", sa.String(20), nullable=False, server_default="pending"),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.UniqueConstraint("team_id", "user_id", name="uq_join_requests_team_user"),
    )
    op.create_index("ix_join_requests_team", "join_requests", ["team_id"])
    op.create_index("ix_join_requests_user", "join_requests", ["user_id"])
    op.create_index("ix_join_requests_status", "join_requests", ["status"])

    op.create_table(
        "team_invitations",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "team_id",
            UUID(as_uuid=True),
            sa.ForeignKey("teams.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "user_id",
            UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "invited_by",
            UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("status", sa.String(20), nullable=False, server_default="pending"),
        sa.Column("created_at", sa.DateTime(), nullable=True),
    )
    op.create_index("ix_team_invitations_user", "team_invitations", ["user_id"])
    op.create_index("ix_team_invitations_team", "team_invitations", ["team_id"])
    op.create_index("ix_team_invitations_status", "team_invitations", ["status"])
