from datetime import datetime, timezone

from flask import Blueprint, jsonify, request

from app.contacts.models import Contact
from app.extensions import db
from app.utils.responses import error_response, paginate_query
from app.utils.validators import validate_required_fields
from app.projects.permissions import check_project_access

from .models import Group, GroupMessage

groups_bp = Blueprint("groups", __name__)


def _get_or_404(group_id):
    group = db.session.get(Group, group_id)
    if group is None:
        return None, error_response("Group not found", 404)
    return group, None


@groups_bp.get("")
def list_groups():
    project_id = request.args.get("project_id")
    query = Group.query
    if project_id:
        access_err = check_project_access(project_id)
        if access_err:
            return access_err
        try:
            query = query.filter(Group.project_id == int(project_id))
        except (ValueError, TypeError):
            return error_response("project_id inválido", 400)
    groups = query.order_by(Group.last_activity.desc())
    return paginate_query(groups, lambda g: g.to_dict(include_messages=False))


@groups_bp.post("")
def create_group():
    data = request.get_json(silent=True) or {}
    required_error = validate_required_fields(data, ["name"])
    if required_error:
        return error_response(required_error, 400)

    group_type = data.get("type", "general")
    if group_type not in ("general", "team"):
        return error_response("type must be 'general' or 'team'", 400)

    group = Group(
        name=data["name"].strip(),
        type=group_type,
        team_id=data.get("team_id"),
        project_id=data.get("project_id"),
        last_activity=datetime.now(timezone.utc),
    )

    member_ids = data.get("member_ids", [])
    for mid in member_ids:
        contact = db.session.get(Contact, mid)
        if contact:
            group.members.append(contact)

    db.session.add(group)
    db.session.commit()
    return jsonify(group.to_dict()), 201


@groups_bp.get("/<int:group_id>")
def get_group(group_id):
    group, err = _get_or_404(group_id)
    if err:
        return err
    return jsonify(group.to_dict()), 200


@groups_bp.put("/<int:group_id>")
def update_group(group_id):
    group, err = _get_or_404(group_id)
    if err:
        return err

    data = request.get_json(silent=True) or {}

    if "name" in data:
        if not data["name"]:
            return error_response("name is required", 400)
        group.name = data["name"].strip()

    if "type" in data:
        if data["type"] not in ("general", "team"):
            return error_response("type must be 'general' or 'team'", 400)
        group.type = data["type"]

    if "team_id" in data:
        group.team_id = data["team_id"]

    if "member_ids" in data:
        group.members = []
        for mid in data["member_ids"]:
            contact = db.session.get(Contact, mid)
            if contact:
                group.members.append(contact)

    db.session.commit()
    return jsonify(group.to_dict()), 200


@groups_bp.delete("/<int:group_id>")
def delete_group(group_id):
    group, err = _get_or_404(group_id)
    if err:
        return err
    db.session.delete(group)
    db.session.commit()
    return jsonify({"message": "group deleted"}), 200


# ── Messages ──────────────────────────────────────────────

@groups_bp.get("/<int:group_id>/messages")
def list_messages(group_id):
    group, err = _get_or_404(group_id)
    if err:
        return err
    messages = (
        GroupMessage.query
        .filter_by(group_id=group_id)
        .order_by(GroupMessage.timestamp.asc())
        .all()
    )
    return jsonify([m.to_dict() for m in messages]), 200


@groups_bp.post("/<int:group_id>/messages")
def send_message(group_id):
    _, err = _get_or_404(group_id)
    if err:
        return err

    data = request.get_json(silent=True) or {}
    required_error = validate_required_fields(data, ["sender_id", "content"])
    if required_error:
        return error_response(required_error, 400)

    from app.contacts.models import Contact
    from app.projects.permissions import get_current_user, is_super_admin
    sender = db.session.get(Contact, int(data["sender_id"]))
    if sender is None:
        return error_response("Sender contact not found", 404)
    current_user = get_current_user()
    is_admin = current_user and (is_super_admin(current_user) or current_user.role == "admin")
    member_ids = [m.id for m in group.members]
    if not is_admin and sender.id not in member_ids:
        return error_response("Remetente não é membro do grupo", 403)

    msg_type = data.get("type", "text")
    blocked = data.get("blocked", False)

    message = GroupMessage(
        group_id=group_id,
        sender_id=sender.id,
        content=data["content"],
        type=msg_type,
        blocked=blocked,
        image_url=data.get("image_url"),
    )

    group.last_activity = datetime.now(timezone.utc)
    db.session.add(message)
    db.session.commit()
    return jsonify(message.to_dict()), 201
