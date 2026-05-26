"""add file fields to contact documents

Revision ID: c3d4e5f6a7b8
Revises: a2b3c4d5e6f7
Create Date: 2025-01-15 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'c3d4e5f6a7b8'
down_revision = 'a2b3c4d5e6f7'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('contact_documents', sa.Column('original_filename', sa.String(255), nullable=True))
    op.add_column('contact_documents', sa.Column('storage_path', sa.String(500), nullable=True))
    op.add_column('contact_documents', sa.Column('mime_type', sa.String(100), nullable=True))


def downgrade():
    op.drop_column('contact_documents', 'mime_type')
    op.drop_column('contact_documents', 'storage_path')
    op.drop_column('contact_documents', 'original_filename')
