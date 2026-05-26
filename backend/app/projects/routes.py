from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.extensions import db
from app.utils.responses import error_response, success_response
from app.projects.models import Project, ProjectMember
from app.projects.permissions import get_current_user, is_super_admin, is_project_admin, get_membership

projects_bp = Blueprint("projects", __name__)


@projects_bp.route("", methods=["GET"])
@jwt_required()
def list_projects():
    user = get_current_user()
    if not user:
        return error_response("Usuário não encontrado", 404)

    from app.projects.permissions import get_user_projects
    projects = get_user_projects(user)
    return jsonify({"data": projects}), 200


@projects_bp.route("", methods=["POST"])
@jwt_required()
def create_project():
    user = get_current_user()
    if not user:
        return error_response("Usuário não encontrado", 404)

    data = request.get_json() or {}
    name = (data.get("name") or "").strip()
    if not name:
        return error_response("O nome do projeto é obrigatório", 400)

    slug = Project.make_unique_slug(name)
    project = Project(
        name=name,
        slug=slug,
        description=data.get("description"),
        owner_id=user.id,
        status="ACTIVE",
    )
    db.session.add(project)
    db.session.flush()

    member = ProjectMember(
        project_id=project.id,
        user_id=user.id,
        role="ADMIN",
        status="ACTIVE",
        invited_by_id=None,
    )
    db.session.add(member)
    db.session.commit()

    return jsonify({"data": project.to_dict(include_members=True)}), 201


@projects_bp.route("/<int:project_id>", methods=["GET"])
@jwt_required()
def get_project(project_id):
    user = get_current_user()
    project = db.session.get(Project, project_id)
    if not project:
        return error_response("Projeto não encontrado", 404)

    if not is_project_admin(user, project_id) and not get_membership(user, project_id):
        return error_response("Acesso negado", 403)

    return jsonify({"data": project.to_dict(include_members=True)}), 200


@projects_bp.route("/<int:project_id>", methods=["PATCH"])
@jwt_required()
def update_project(project_id):
    user = get_current_user()
    project = db.session.get(Project, project_id)
    if not project:
        return error_response("Projeto não encontrado", 404)

    if not is_project_admin(user, project_id):
        return error_response("Apenas admins podem editar o projeto", 403)

    data = request.get_json() or {}
    if "name" in data and data["name"].strip():
        project.name = data["name"].strip()
    if "description" in data:
        project.description = data["description"]

    db.session.commit()
    return jsonify({"data": project.to_dict()}), 200


@projects_bp.route("/<int:project_id>", methods=["DELETE"])
@jwt_required()
def archive_project(project_id):
    user = get_current_user()
    project = db.session.get(Project, project_id)
    if not project:
        return error_response("Projeto não encontrado", 404)

    if project.owner_id != user.id and not is_super_admin(user):
        return error_response("Apenas o dono do projeto pode arquivá-lo", 403)

    project.status = "ARCHIVED"
    db.session.commit()
    return jsonify({"message": "Projeto arquivado"}), 200


# ── Member management ──────────────────────────────────────────────────────

@projects_bp.route("/<int:project_id>/members", methods=["GET"])
@jwt_required()
def list_members(project_id):
    user = get_current_user()
    project = db.session.get(Project, project_id)
    if not project:
        return error_response("Projeto não encontrado", 404)

    if not get_membership(user, project_id) and not is_super_admin(user):
        return error_response("Acesso negado", 403)

    members = ProjectMember.query.filter_by(project_id=project_id, status="ACTIVE").all()
    return jsonify({"data": [m.to_dict() for m in members]}), 200


@projects_bp.route("/<int:project_id>/members", methods=["POST"])
@jwt_required()
def add_member(project_id):
    user = get_current_user()
    if not is_project_admin(user, project_id):
        return error_response("Apenas admins podem convidar membros", 403)

    project = db.session.get(Project, project_id)
    if not project:
        return error_response("Projeto não encontrado", 404)

    data = request.get_json() or {}
    user_id = data.get("user_id")
    role = data.get("role", "PROFESSIONAL")

    if not user_id:
        return error_response("user_id é obrigatório", 400)
    if role not in ("ADMIN", "PROFESSIONAL"):
        return error_response("Role inválida. Use ADMIN ou PROFESSIONAL", 400)

    existing = ProjectMember.query.filter_by(project_id=project_id, user_id=user_id).first()
    if existing:
        if existing.status == "ACTIVE":
            return error_response("Usuário já é membro deste projeto", 409)
        existing.status = "ACTIVE"
        existing.role = role
        db.session.commit()
        return jsonify({"data": existing.to_dict()}), 200

    from app.auth.models import User
    invited_user = db.session.get(User, user_id)
    if not invited_user:
        return error_response("Usuário não encontrado", 404)

    from datetime import datetime, timezone
    member = ProjectMember(
        project_id=project_id,
        user_id=user_id,
        role=role,
        status="ACTIVE",
        invited_by_id=user.id,
        joined_at=datetime.now(timezone.utc),
    )
    db.session.add(member)
    db.session.commit()
    return jsonify({"data": member.to_dict()}), 201


@projects_bp.route("/<int:project_id>/members/<int:member_id>/role", methods=["PATCH"])
@jwt_required()
def change_member_role(project_id, member_id):
    user = get_current_user()
    if not is_project_admin(user, project_id):
        return error_response("Apenas admins podem alterar roles", 403)

    member = ProjectMember.query.filter_by(id=member_id, project_id=project_id).first()
    if not member:
        return error_response("Membro não encontrado", 404)

    data = request.get_json() or {}
    role = data.get("role")
    if role not in ("ADMIN", "PROFESSIONAL"):
        return error_response("Role inválida. Use ADMIN ou PROFESSIONAL", 400)

    member.role = role
    db.session.commit()
    return jsonify({"data": member.to_dict()}), 200


@projects_bp.route("/<int:project_id>/members/<int:member_id>", methods=["DELETE"])
@jwt_required()
def remove_member(project_id, member_id):
    user = get_current_user()
    if not is_project_admin(user, project_id):
        return error_response("Apenas admins podem remover membros", 403)

    member = ProjectMember.query.filter_by(id=member_id, project_id=project_id).first()
    if not member:
        return error_response("Membro não encontrado", 404)

    # Cannot remove the project owner
    project = db.session.get(Project, project_id)
    if project and member.user_id == project.owner_id:
        return error_response("Não é possível remover o dono do projeto", 400)

    member.status = "REMOVED"
    db.session.commit()
    return jsonify({"message": "Membro removido"}), 200


# ── Invite by @username ────────────────────────────────────────────────────────

@projects_bp.route("/<int:project_id>/members/by-username", methods=["POST"])
@jwt_required()
def invite_member_by_username(project_id):
    from datetime import datetime, timezone
    from app.auth.models import User
    from app.invitations.models import MemberInvitation, Notification

    user = get_current_user()
    if not is_project_admin(user, project_id):
        return error_response("Apenas administradores podem convidar membros", 403)

    project = db.session.get(Project, project_id)
    if not project:
        return error_response("Projeto não encontrado", 404)

    data = request.get_json() or {}
    username = (data.get("username") or "").strip().lstrip("@").lower()
    role = data.get("role", "PROFESSIONAL")

    if not username:
        return error_response("Username é obrigatório", 400)
    if role not in ("ADMIN", "PROFESSIONAL"):
        return error_response("Papel inválido. Use ADMIN ou PROFESSIONAL", 400)

    target_user = User.query.filter_by(username=username).first()
    if not target_user:
        return error_response("Usuário não encontrado", 404)

    existing_member = ProjectMember.query.filter_by(
        project_id=project_id, user_id=target_user.id, status="ACTIVE"
    ).first()
    if existing_member:
        return error_response("Usuário já é membro ativo deste projeto", 409)

    pending = MemberInvitation.query.filter_by(
        project_id=project_id, invited_user_id=target_user.id, status="PENDING"
    ).first()
    if pending:
        return error_response("Já existe um convite pendente para este usuário", 409)

    invitation = MemberInvitation(
        project_id=project_id,
        invited_user_id=target_user.id,
        invited_by_id=user.id,
        role=role,
        status="PENDING",
    )
    db.session.add(invitation)

    notification = Notification(
        user_id=target_user.id,
        project_id=project_id,
        type="INVITE",
        title=f"Convite para {project.name}",
        content=f"{user.name} convidou você para o projeto '{project.name}' como {role}.",
        is_read=False,
    )
    db.session.add(notification)
    db.session.commit()

    return jsonify(invitation.to_dict()), 201


# ── Link-based invite management ───────────────────────────────────────────────

@projects_bp.route("/<int:project_id>/invites", methods=["POST"])
@jwt_required()
def create_project_invite(project_id):
    from datetime import datetime, timezone, timedelta
    from app.invitations.models import ProjectInvite

    user = get_current_user()
    if not is_project_admin(user, project_id):
        return error_response("Apenas administradores podem criar convites", 403)

    project = db.session.get(Project, project_id)
    if not project:
        return error_response("Projeto não encontrado", 404)

    data = request.get_json() or {}
    role = data.get("role", "PROFESSIONAL")
    if role not in ("ADMIN", "PROFESSIONAL"):
        return error_response("Papel inválido", 400)

    expires_in_days = data.get("expiresInDays") or data.get("expires_in_days")
    max_uses_raw = data.get("maxUses") or data.get("max_uses")

    expires_at = None
    if expires_in_days:
        expires_at = datetime.now(timezone.utc) + timedelta(days=int(expires_in_days))

    invite = ProjectInvite(
        project_id=project_id,
        token=ProjectInvite.generate_token(),
        role=role,
        created_by_id=user.id,
        expires_at=expires_at,
        max_uses=int(max_uses_raw) if max_uses_raw else None,
        used_count=0,
        is_active=True,
    )
    db.session.add(invite)
    db.session.commit()

    return jsonify(invite.to_dict(include_url=True)), 201


@projects_bp.route("/<int:project_id>/invites", methods=["GET"])
@jwt_required()
def list_project_invites(project_id):
    from app.invitations.models import ProjectInvite

    user = get_current_user()
    if not is_project_admin(user, project_id):
        return error_response("Acesso negado", 403)

    invites = (
        ProjectInvite.query
        .filter_by(project_id=project_id, is_active=True)
        .order_by(ProjectInvite.created_at.desc())
        .all()
    )
    return jsonify({"data": [i.to_dict(include_url=True) for i in invites]}), 200


@projects_bp.route("/<int:project_id>/invites/<int:invite_id>/revoke", methods=["POST"])
@jwt_required()
def revoke_project_invite(project_id, invite_id):
    from app.invitations.models import ProjectInvite

    user = get_current_user()
    if not is_project_admin(user, project_id):
        return error_response("Acesso negado", 403)

    invite = ProjectInvite.query.filter_by(id=invite_id, project_id=project_id).first()
    if not invite:
        return error_response("Convite não encontrado", 404)

    invite.is_active = False
    db.session.commit()
    return jsonify(invite.to_dict()), 200
