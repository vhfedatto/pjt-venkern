from flask_jwt_extended import get_jwt_identity
from app.extensions import db


def get_current_user():
    from app.auth.models import User
    user_id = get_jwt_identity()
    return db.session.get(User, int(user_id))


def is_super_admin(user):
    return bool(user and user.is_super_admin)


def get_membership(user, project_id):
    from app.projects.models import ProjectMember
    return ProjectMember.query.filter_by(
        user_id=user.id,
        project_id=int(project_id),
        status="ACTIVE"
    ).first()


def is_project_member(user, project_id):
    return is_super_admin(user) or get_membership(user, project_id) is not None


def is_project_admin(user, project_id):
    if is_super_admin(user):
        return True
    membership = get_membership(user, project_id)
    return membership is not None and membership.role == "ADMIN"


def get_user_projects(user):
    """Return list of active Project dicts for user, with their role."""
    from app.projects.models import Project, ProjectMember
    if is_super_admin(user):
        projects = Project.query.filter_by(status="ACTIVE").all()
        result = []
        for p in projects:
            d = p.to_dict()
            d["role"] = "SUPER_ADMIN"
            result.append(d)
        return result

    memberships = ProjectMember.query.filter_by(user_id=user.id, status="ACTIVE").all()
    result = []
    for m in memberships:
        if m.project and m.project.status == "ACTIVE":
            d = m.project.to_dict()
            d["role"] = m.role
            result.append(d)
    return result


def check_project_access(project_id):
    """Return an error response tuple if the current user is not a member of
    the given project, else None.  Call this in list endpoints that accept a
    ?project_id query parameter."""
    from app.utils.responses import error_response
    try:
        pid = int(project_id)
    except (ValueError, TypeError):
        return error_response("project_id inválido", 400)
    user = get_current_user()
    if user is None:
        return error_response("Usuário não encontrado", 404)
    if not is_project_member(user, pid):
        return error_response("Acesso negado ao projeto", 403)
    return None
