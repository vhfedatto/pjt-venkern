from datetime import datetime, timezone

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from app.extensions import db
from app.groups.services import sync_contact_team_group
from app.projects.permissions import check_project_access
from app.utils.responses import error_response
from app.utils.validators import validate_required_fields
from .models import Team

teams_bp = Blueprint("teams", __name__)


def _require_admin():
    """Return (user, error_response) — error_response is None when caller is admin."""
    from app.auth.models import User
    user_id = int(get_jwt_identity())
    caller = db.session.get(User, user_id)
    if not caller or caller.role != "admin":
        return None, error_response("Acesso negado", 403)
    return caller, None


def _get_team_or_404(team_id):
    team = db.session.get(Team, team_id)
    if team is None:
        return None, error_response("Team not found", 404)
    return team, None


@teams_bp.get("")
def list_teams():
    project_id = request.args.get("project_id")
    query = Team.query
    if project_id:
        access_err = check_project_access(project_id)
        if access_err:
            return access_err
        try:
            query = query.filter(Team.project_id == int(project_id))
        except (ValueError, TypeError):
            return error_response("project_id inválido", 400)
    teams = query.order_by(Team.name.asc()).all()
    return jsonify([team.to_dict() for team in teams]), 200


@teams_bp.post("")
@jwt_required()
def create_team():
    _, err = _require_admin()
    if err:
        return err

    data = request.get_json(silent=True) or {}
    required_error = validate_required_fields(data, ["name"])
    if required_error:
        return error_response(required_error, 400)

    name = data.get("name").strip()

    team = Team(
        name=name,
        description=data.get("description"),
        color=data.get("color"),
        project_id=data.get("project_id"),
    )

    db.session.add(team)
    db.session.flush()  # get team.id before commit

    # Auto-create a matching group for this team
    from app.groups.models import Group
    group = Group(
        name=name,
        type="team",
        team_id=team.id,
        project_id=team.project_id,
        last_activity=datetime.now(timezone.utc),
    )
    db.session.add(group)
    db.session.commit()

    return jsonify(team.to_dict()), 201


@teams_bp.get("/<int:team_id>")
def get_team(team_id):
    team, err = _get_team_or_404(team_id)
    if err:
        return err

    return jsonify(team.to_dict()), 200


@teams_bp.put("/<int:team_id>")
@jwt_required()
def update_team(team_id):
    _, err = _require_admin()
    if err:
        return err

    team, err = _get_team_or_404(team_id)
    if err:
        return err

    data = request.get_json(silent=True) or {}

    if "name" in data:
        required_error = validate_required_fields(data, ["name"])
        if required_error:
            return error_response(required_error, 400)
        team.name = data.get("name").strip()

    if "description" in data:
        team.description = data.get("description")

    if "color" in data:
        team.color = data.get("color")

    db.session.commit()

    return jsonify(team.to_dict()), 200


@teams_bp.delete("/<int:team_id>")
@jwt_required()
def delete_team(team_id):
    _, err = _require_admin()
    if err:
        return err

    team, err = _get_team_or_404(team_id)
    if err:
        return err

    if team.contacts:
        return error_response("Team has linked contacts and cannot be deleted", 400)

    db.session.delete(team)
    db.session.commit()

    return jsonify({"message": "team deleted successfully"}), 200


# ── Member management ──────────────────────────────────────────────────────────

@teams_bp.post("/<int:team_id>/members")
@jwt_required()
def add_member(team_id):
    """Invite a platform user to a team (admin only).

    Body: { "user_id": <int> }
    Finds or creates a Contact record for that user and links it to the team.
    """
    _, err = _require_admin()
    if err:
        return err

    team, err = _get_team_or_404(team_id)
    if err:
        return err

    data = request.get_json(silent=True) or {}
    target_user_id = data.get("user_id")
    contact_id = data.get("contact_id")
    if not target_user_id and not contact_id:
        return error_response("user_id ou contact_id é obrigatório", 400)

    from app.auth.models import User
    from app.contacts.models import Contact

    if contact_id:
        contact = db.session.get(Contact, int(contact_id))
        if not contact:
            return error_response("Contato não encontrado", 404)
        if team.project_id is not None and contact.project_id not in (None, team.project_id):
            return error_response("Contato pertence a outra empresa", 400)
        previous_team_id = contact.team_id
        contact.team_id = team_id
        contact.project_id = team.project_id
        sync_contact_team_group(contact, previous_team_id)
        db.session.commit()
        return jsonify(team.to_dict()), 200

    target_user = db.session.get(User, int(target_user_id))
    if not target_user:
        return error_response("Usuário não encontrado", 404)

    contact = Contact.query.filter_by(email=target_user.email, project_id=team.project_id).first()
    if contact:
        previous_team_id = contact.team_id
        contact.team_id = team_id
    else:
        contact = Contact(
            full_name=target_user.name,
            email=target_user.email,
            phone="",
            team_id=team_id,
            project_id=team.project_id,
        )
        db.session.add(contact)
        db.session.flush()
        previous_team_id = None

    sync_contact_team_group(contact, previous_team_id)
    db.session.commit()
    return jsonify(team.to_dict()), 200


@teams_bp.delete("/<int:team_id>/members/<int:contact_id>")
@jwt_required()
def remove_member(team_id, contact_id):
    """Remove a contact from a team (admin only)."""
    _, err = _require_admin()
    if err:
        return err

    team, err = _get_team_or_404(team_id)
    if err:
        return err

    from app.contacts.models import Contact

    contact = Contact.query.filter_by(id=contact_id, team_id=team_id).first()
    if not contact:
        return error_response("Membro não encontrado nesta equipe", 404)

    previous_team_id = contact.team_id
    contact.team_id = None
    sync_contact_team_group(contact, previous_team_id)
    db.session.commit()
    return jsonify(team.to_dict()), 200


@teams_bp.get("/<int:team_id>/candidates")
@jwt_required()
def search_candidates(team_id):
    _, err = _require_admin()
    if err:
        return err

    team, err = _get_team_or_404(team_id)
    if err:
        return err

    q = (request.args.get("q") or "").strip().lstrip("@")
    if len(q) < 2:
        return jsonify([]), 200

    from app.auth.models import User
    from app.contacts.models import Contact
    from app.projects.models import ProjectMember

    like = f"%{q}%"

    users_query = (
        User.query
        .join(ProjectMember, ProjectMember.user_id == User.id)
        .filter(ProjectMember.status == "ACTIVE")
        .filter(ProjectMember.project_id == team.project_id)
        .filter(db.or_(User.username.ilike(like), User.name.ilike(like)))
        .limit(10)
        .all()
    )

    contacts_query = (
        Contact.query
        .filter(Contact.project_id == team.project_id)
        .filter(db.or_(Contact.full_name.ilike(like), Contact.email.ilike(like)))
        .limit(10)
        .all()
    )

    results = []
    user_emails = set()

    for user in users_query:
        linked_contact = Contact.query.filter_by(email=user.email, project_id=team.project_id).first()
        user_emails.add(user.email.lower())
        results.append({
            "kind": "user",
            "id": user.id,
            "contact_id": linked_contact.id if linked_contact else None,
            "name": user.name,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "already_member": bool(linked_contact and linked_contact.team_id == team.id),
        })

    for contact in contacts_query:
        if contact.email.lower() in user_emails:
            continue
        results.append({
            "kind": "contact",
            "id": contact.id,
            "contact_id": contact.id,
            "name": contact.full_name,
            "username": None,
            "email": contact.email,
            "role": contact.role,
            "already_member": contact.team_id == team.id,
        })

    return jsonify(results), 200
