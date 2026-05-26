import os
from pathlib import Path
from types import SimpleNamespace

import pytest

@pytest.fixture()
def app(tmp_path: Path):
    db_path = tmp_path / "test.sqlite"
    os.environ["DATABASE_URL"] = f"sqlite:///{db_path.as_posix()}"
    os.environ["FLASK_ENV"] = "development"
    os.environ["SECRET_KEY"] = "test-secret-key-with-safe-length-123456"
    os.environ["JWT_SECRET_KEY"] = "test-jwt-secret-key-with-safe-length-123456"
    os.environ["CORS_ORIGINS"] = "http://localhost:5173"

    from app import create_app
    from app.extensions import db

    app = create_app()
    app.config.update(
        TESTING=True,
        SQLALCHEMY_DATABASE_URI=f"sqlite:///{db_path.as_posix()}",
    )

    with app.app_context():
        db.drop_all()
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture()
def client(app):
    return app.test_client()


def _create_user(name: str, email: str, password: str, role: str = "admin", username: str | None = None):
    from app.auth.models import User
    from app.extensions import db

    user = User(
        name=name,
        email=email,
        username=username,
        role=role,
        is_active=True,
        status="ACTIVE",
    )
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    return user


@pytest.fixture()
def admin_user(app):
    with app.app_context():
        user = _create_user("Admin Test", "admin@test.com", "12345678", role="admin", username="admintest")
        return SimpleNamespace(id=user.id, email=user.email, username=user.username)


@pytest.fixture()
def professional_user(app):
    with app.app_context():
        user = _create_user("Pro Test", "pro@test.com", "12345678", role="professional", username="protest")
        return SimpleNamespace(id=user.id, email=user.email, username=user.username)


@pytest.fixture()
def auth_headers(client, admin_user):
    response = client.post("/api/auth/login", json={"email": admin_user.email, "password": "12345678"})
    token = response.get_json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture()
def project(app, admin_user):
    from app.extensions import db
    from app.projects.models import Project, ProjectMember

    with app.app_context():
        project = Project(
            name="Projeto Teste",
            slug="projeto-teste",
            description="Projeto de testes",
            owner_id=admin_user.id,
            status="ACTIVE",
        )
        db.session.add(project)
        db.session.flush()
        membership = ProjectMember(
            project_id=project.id,
            user_id=admin_user.id,
            role="ADMIN",
            status="ACTIVE",
            invited_by_id=admin_user.id,
        )
        db.session.add(membership)
        db.session.commit()
        return SimpleNamespace(id=project.id, owner_id=project.owner_id, slug=project.slug)


@pytest.fixture()
def professional_membership(app, project, professional_user):
    from app.extensions import db
    from app.projects.models import ProjectMember

    with app.app_context():
        membership = ProjectMember(
            project_id=project.id,
            user_id=professional_user.id,
            role="PROFESSIONAL",
            status="ACTIVE",
            invited_by_id=project.owner_id,
        )
        db.session.add(membership)
        db.session.commit()
        return SimpleNamespace(id=membership.id, project_id=membership.project_id, user_id=membership.user_id)


@pytest.fixture()
def team(app, project):
    from app.extensions import db
    from app.teams.models import Team

    with app.app_context():
        team = Team(
            project_id=project.id,
            name="Equipe Teste",
            description="Equipe de testes",
            color="#6366f1",
        )
        db.session.add(team)
        db.session.commit()
        return SimpleNamespace(id=team.id, project_id=team.project_id, name=team.name)


@pytest.fixture()
def contact(app, project, team, professional_user):
    from app.contacts.models import Contact
    from app.extensions import db

    with app.app_context():
        contact = Contact(
            project_id=project.id,
            team_id=team.id,
            full_name="Contato Teste",
            email=professional_user.email,
            phone="11999999999",
            role="professional",
            function_type="Analyst",
            notes="Contato base",
        )
        db.session.add(contact)
        db.session.commit()
        return SimpleNamespace(id=contact.id, project_id=contact.project_id, email=contact.email, team_id=contact.team_id)
