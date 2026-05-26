"""add projects, project_members, and project_id to all models

Revision ID: f1a2b3c4d5e6
Revises: a1b2c3d4e5f6
Create Date: 2026-05-17 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'f1a2b3c4d5e6'
down_revision = 'a1b2c3d4e5f6'
branch_labels = None
depends_on = None


def upgrade():
    # ── 1. Add is_super_admin + status to users ─────────────────────────────
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.add_column(sa.Column('is_super_admin', sa.Boolean(), nullable=False, server_default='0'))
        batch_op.add_column(sa.Column('status', sa.String(length=20), nullable=False, server_default='ACTIVE'))

    # ── 2. Create projects table ─────────────────────────────────────────────
    op.create_table(
        'projects',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('slug', sa.String(length=120), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('owner_id', sa.Integer(), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='ACTIVE'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['owner_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('slug'),
    )
    op.create_index('ix_projects_slug', 'projects', ['slug'])

    # ── 3. Create project_members table ─────────────────────────────────────
    op.create_table(
        'project_members',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('project_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('role', sa.String(length=20), nullable=False, server_default='PROFESSIONAL'),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='ACTIVE'),
        sa.Column('invited_by_id', sa.Integer(), nullable=True),
        sa.Column('joined_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id']),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.ForeignKeyConstraint(['invited_by_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('project_id', 'user_id', name='uq_project_member'),
    )

    # ── 4. Seed: create default project from first user (if any exists) ──────
    connection = op.get_bind()
    first_user = connection.execute(sa.text("SELECT id, name FROM users ORDER BY id LIMIT 1")).fetchone()
    default_project_id = None
    if first_user:
        connection.execute(
            sa.text(
                "INSERT INTO projects (name, slug, description, owner_id, status, created_at, updated_at) "
                "VALUES (:name, :slug, :desc, :owner, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)"
            ),
            {"name": "Projeto Padrão", "slug": "projeto-padrao", "desc": "Projeto migrado automaticamente", "owner": first_user[0]},
        )
        result = connection.execute(sa.text("SELECT id FROM projects WHERE slug = 'projeto-padrao'")).fetchone()
        if result:
            default_project_id = result[0]
            # Add owner as ADMIN member
            connection.execute(
                sa.text(
                    "INSERT INTO project_members (project_id, user_id, role, status, joined_at, created_at, updated_at) "
                    "VALUES (:pid, :uid, 'ADMIN', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)"
                ),
                {"pid": default_project_id, "uid": first_user[0]},
            )
            # Add remaining users as PROFESSIONAL members
            other_users = connection.execute(sa.text("SELECT id FROM users WHERE id != :uid"), {"uid": first_user[0]}).fetchall()
            for u in other_users:
                connection.execute(
                    sa.text(
                        "INSERT INTO project_members (project_id, user_id, role, status, joined_at, created_at, updated_at) "
                        "VALUES (:pid, :uid, 'PROFESSIONAL', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)"
                    ),
                    {"pid": default_project_id, "uid": u[0]},
                )

    # ── 5. Add project_id to contacts ────────────────────────────────────────
    with op.batch_alter_table('contacts', schema=None) as batch_op:
        batch_op.add_column(sa.Column('project_id', sa.Integer(), nullable=True))
        batch_op.create_index('ix_contacts_project_id', ['project_id'])
        batch_op.create_foreign_key('fk_contacts_project_id', 'projects', ['project_id'], ['id'])
        # Remove unique constraint on email
        batch_op.drop_constraint('contacts_email_key', type_='unique')

    # ── 6. Add project_id to teams ───────────────────────────────────────────
    with op.batch_alter_table('teams', schema=None) as batch_op:
        batch_op.add_column(sa.Column('project_id', sa.Integer(), nullable=True))
        batch_op.create_index('ix_teams_project_id', ['project_id'])
        batch_op.create_foreign_key('fk_teams_project_id', 'projects', ['project_id'], ['id'])

    # ── 7. Add project_id to tasks ───────────────────────────────────────────
    with op.batch_alter_table('tasks', schema=None) as batch_op:
        batch_op.add_column(sa.Column('project_id', sa.Integer(), nullable=True))
        batch_op.create_index('ix_tasks_project_id', ['project_id'])
        batch_op.create_foreign_key('fk_tasks_project_id', 'projects', ['project_id'], ['id'])

    # ── 8. Add project_id to events ──────────────────────────────────────────
    with op.batch_alter_table('events', schema=None) as batch_op:
        batch_op.add_column(sa.Column('project_id', sa.Integer(), nullable=True))
        batch_op.create_index('ix_events_project_id', ['project_id'])
        batch_op.create_foreign_key('fk_events_project_id', 'projects', ['project_id'], ['id'])

    # ── 9. Add project_id to groups ──────────────────────────────────────────
    with op.batch_alter_table('groups', schema=None) as batch_op:
        batch_op.add_column(sa.Column('project_id', sa.Integer(), nullable=True))
        batch_op.create_index('ix_groups_project_id', ['project_id'])
        batch_op.create_foreign_key('fk_groups_project_id', 'projects', ['project_id'], ['id'])

    # ── 10. Add project_id to chat_conversations ──────────────────────────────
    with op.batch_alter_table('chat_conversations', schema=None) as batch_op:
        batch_op.add_column(sa.Column('project_id', sa.Integer(), nullable=True))
        batch_op.create_index('ix_chat_conversations_project_id', ['project_id'])
        batch_op.create_foreign_key('fk_chat_conversations_project_id', 'projects', ['project_id'], ['id'])

    # ── 11. Add project_id to moderation_alerts ───────────────────────────────
    with op.batch_alter_table('moderation_alerts', schema=None) as batch_op:
        batch_op.add_column(sa.Column('project_id', sa.Integer(), nullable=True))
        batch_op.create_index('ix_moderation_alerts_project_id', ['project_id'])
        batch_op.create_foreign_key('fk_moderation_alerts_project_id', 'projects', ['project_id'], ['id'])

    # ── 12. Backfill project_id with default project ──────────────────────────
    if default_project_id:
        for table in ('contacts', 'teams', 'tasks', 'events', 'groups', 'chat_conversations', 'moderation_alerts'):
            connection.execute(
                sa.text(f"UPDATE {table} SET project_id = :pid WHERE project_id IS NULL"),
                {"pid": default_project_id},
            )


def downgrade():
    for table in ('moderation_alerts', 'chat_conversations', 'groups', 'events', 'tasks', 'teams'):
        with op.batch_alter_table(table, schema=None) as batch_op:
            batch_op.drop_constraint(f'fk_{table}_project_id', type_='foreignkey')
            batch_op.drop_index(f'ix_{table}_project_id')
            batch_op.drop_column('project_id')

    with op.batch_alter_table('contacts', schema=None) as batch_op:
        batch_op.drop_constraint('fk_contacts_project_id', type_='foreignkey')
        batch_op.drop_index('ix_contacts_project_id')
        batch_op.drop_column('project_id')
        batch_op.create_unique_constraint('contacts_email_key', ['email'])

    op.drop_table('project_members')
    op.drop_index('ix_projects_slug', 'projects')
    op.drop_table('projects')

    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.drop_column('status')
        batch_op.drop_column('is_super_admin')
