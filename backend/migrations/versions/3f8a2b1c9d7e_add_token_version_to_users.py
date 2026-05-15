"""add_token_version_to_users

Revision ID: 3f8a2b1c9d7e
Revises: 05bffdaca56b
Create Date: 2026-05-15 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '3f8a2b1c9d7e'
down_revision: Union[str, Sequence[str], None] = '05bffdaca56b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        'users',
        sa.Column('token_version', sa.Integer(), nullable=False, server_default='1'),
    )


def downgrade() -> None:
    op.drop_column('users', 'token_version')
