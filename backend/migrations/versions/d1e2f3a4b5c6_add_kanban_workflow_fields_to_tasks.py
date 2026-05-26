"""add kanban workflow fields to tasks

Revision ID: d1e2f3a4b5c6
Revises: c3d4e5f6a7b8
Create Date: 2026-05-18 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'd1e2f3a4b5c6'
down_revision = 'c3d4e5f6a7b8'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('tasks', schema=None) as batch_op:
        batch_op.add_column(sa.Column('accepted_at', sa.DateTime(timezone=True), nullable=True))
        batch_op.add_column(sa.Column('completion_note', sa.Text(), nullable=True))
        batch_op.add_column(sa.Column('completion_file_url', sa.String(length=500), nullable=True))


def downgrade():
    with op.batch_alter_table('tasks', schema=None) as batch_op:
        batch_op.drop_column('completion_file_url')
        batch_op.drop_column('completion_note')
        batch_op.drop_column('accepted_at')
