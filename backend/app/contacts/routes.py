from datetime import date

from flask import Blueprint, request, jsonify
from sqlalchemy.exc import IntegrityError

from app.extensions import db
from app.projects.permissions import check_project_access
from app.utils.responses import error_response, paginate_query
from app.utils.validators import parse_int, validate_email, validate_required_fields
from app.groups.services import sync_contact_team_group
from app.teams.models import Team
from .models import Contact

CONTACT_ORIGINS = {"whatsapp", "instagram", "email", "indicacao", "evento", "manual"}

contacts_bp = Blueprint("contacts", __name__)

@contacts_bp.get("")
def list_contacts():
    search = request.args.get("search")
    favorite = request.args.get("favorite")
    team_id = request.args.get("team_id")
    project_id = request.args.get("project_id")

    query = Contact.query

    if project_id:
        access_err = check_project_access(project_id)
        if access_err:
            return access_err
        try:
            query = query.filter(Contact.project_id == parse_int(project_id, "project_id"))
        except ValueError as exc:
            return error_response(str(exc), 400)

    if search:
        term = f"%{search}%"
        query = query.filter(
            (Contact.full_name.ilike(term)) |
            (Contact.email.ilike(term)) |
            (Contact.phone.ilike(term))
        )

    if favorite is not None:
        query = query.filter(Contact.is_favorite == (favorite.lower() == "true"))

    if team_id:
        try:
            query = query.filter(Contact.team_id == parse_int(team_id, "team_id"))
        except ValueError as exc:
            return error_response(str(exc), 400)

    contacts = query.order_by(Contact.full_name.asc())

    return paginate_query(contacts, lambda c: c.to_dict())


@contacts_bp.post("")
def create_contact():
    data = request.get_json(silent=True) or {}

    required_error = validate_required_fields(data, ["full_name", "phone", "email"])
    if required_error:
        return error_response(required_error, 400)

    email_error = validate_email(data.get("email"))
    if email_error:
        return error_response(email_error, 400)

    team_id = data.get("team_id")
    if team_id not in (None, ""):
        try:
            team_id = parse_int(team_id, "team_id")
        except ValueError as exc:
            return error_response(str(exc), 400)

        team = db.session.get(Team, team_id)
        if team is None:
            return error_response("team_id does not reference an existing team", 400)

    origin = data.get("origin")
    if origin and origin not in CONTACT_ORIGINS:
        return error_response(f"origin must be one of: {', '.join(sorted(CONTACT_ORIGINS))}", 400)

    responsible_id = data.get("responsible_id")
    if responsible_id not in (None, ""):
        try:
            responsible_id = parse_int(responsible_id, "responsible_id")
        except ValueError as exc:
            return error_response(str(exc), 400)

    next_action_date = None
    if data.get("next_action_date"):
        try:
            next_action_date = date.fromisoformat(data["next_action_date"])
        except ValueError:
            return error_response("next_action_date must be YYYY-MM-DD", 400)

    contact = Contact(
        full_name=data.get("full_name").strip(),
        phone=data.get("phone").strip(),
        email=data.get("email").strip(),
        role=data.get("role"),
        function_type=data.get("function_type"),
        notes=data.get("notes"),
        team_id=team_id,
        is_favorite=data.get("is_favorite", False),
        origin=origin,
        next_action=data.get("next_action"),
        next_action_date=next_action_date,
        responsible_id=responsible_id,
        project_id=team.project_id if team_id else data.get("project_id"),
    )

    try:
        db.session.add(contact)
        db.session.flush()
        sync_contact_team_group(contact)
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return error_response("Email already exists", 400)

    return jsonify(contact.to_dict()), 201


@contacts_bp.get("/<int:contact_id>")
def get_contact(contact_id):
    contact = db.get_or_404(Contact, contact_id)
    return jsonify(contact.to_dict()), 200


@contacts_bp.put("/<int:contact_id>")
def update_contact(contact_id):
    contact = db.get_or_404(Contact, contact_id)
    data = request.get_json(silent=True) or {}
    previous_team_id = contact.team_id

    if "full_name" in data:
        required_error = validate_required_fields(data, ["full_name"])
        if required_error:
            return error_response(required_error, 400)
        contact.full_name = data.get("full_name").strip()

    if "phone" in data:
        required_error = validate_required_fields(data, ["phone"])
        if required_error:
            return error_response(required_error, 400)
        contact.phone = data.get("phone").strip()

    if "email" in data:
        required_error = validate_required_fields(data, ["email"])
        if required_error:
            return error_response(required_error, 400)
        email_error = validate_email(data.get("email"))
        if email_error:
            return error_response(email_error, 400)
        contact.email = data.get("email").strip()

    contact.role = data.get("role", contact.role)
    contact.function_type = data.get("function_type", contact.function_type)
    contact.notes = data.get("notes", contact.notes)

    if "origin" in data:
        origin = data.get("origin")
        if origin and origin not in CONTACT_ORIGINS:
            return error_response(f"origin must be one of: {', '.join(sorted(CONTACT_ORIGINS))}", 400)
        contact.origin = origin

    if "next_action" in data:
        contact.next_action = data.get("next_action")

    if "next_action_date" in data:
        val = data.get("next_action_date")
        if val:
            try:
                contact.next_action_date = date.fromisoformat(val)
            except ValueError:
                return error_response("next_action_date must be YYYY-MM-DD", 400)
        else:
            contact.next_action_date = None

    if "responsible_id" in data:
        rid = data.get("responsible_id")
        if rid in (None, ""):
            contact.responsible_id = None
        else:
            try:
                contact.responsible_id = parse_int(rid, "responsible_id")
            except ValueError as exc:
                return error_response(str(exc), 400)

    if "team_id" in data:
        team_id = data.get("team_id")
        if team_id in (None, ""):
            contact.team_id = None
        else:
            try:
                team_id = parse_int(team_id, "team_id")
            except ValueError as exc:
                return error_response(str(exc), 400)

            team = db.session.get(Team, team_id)
            if team is None:
                return error_response("team_id does not reference an existing team", 400)

            contact.team_id = team_id
            contact.project_id = team.project_id

    sync_contact_team_group(contact, previous_team_id)

    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return error_response("Email already exists", 400)

    return jsonify(contact.to_dict()), 200


@contacts_bp.delete("/<int:contact_id>")
def delete_contact(contact_id):
    contact = db.get_or_404(Contact, contact_id)

    from app.groups.models import group_members, GroupMessage
    from app.tasks.models import Task
    from app.contact_interactions.models import ContactInteraction
    from app.contact_documents.models import ContactDocument
    from app.chats.models import ChatConversation, ChatMessage
    from app.moderation.models import ModerationAlert

    # Unassign tasks
    Task.query.filter_by(assignee_id=contact_id).update({"assignee_id": None})

    # Remove self-referential responsible_id
    Contact.query.filter_by(responsible_id=contact_id).update({"responsible_id": None})

    # Clear uploaded_by and created_by nullable FKs
    ContactDocument.query.filter_by(uploaded_by=contact_id).update({"uploaded_by": None})
    ContactInteraction.query.filter_by(created_by=contact_id).update({"created_by": None})

    # Delete owned records
    ContactDocument.query.filter_by(contact_id=contact_id).delete()
    ContactInteraction.query.filter_by(contact_id=contact_id).delete()

    # Remove from group members and delete their group messages
    db.session.execute(group_members.delete().where(group_members.c.contact_id == contact_id))
    GroupMessage.query.filter_by(sender_id=contact_id).delete()

    # Delete chat conversations where this contact is a participant
    convs = ChatConversation.query.filter(
        db.or_(
            ChatConversation.participant_a == contact_id,
            ChatConversation.participant_b == contact_id,
        )
    ).all()
    for conv in convs:
        ChatMessage.query.filter_by(conversation_id=conv.id).delete()
        db.session.delete(conv)

    # Delete moderation alerts
    ModerationAlert.query.filter_by(user_id=contact_id).delete()

    db.session.delete(contact)
    db.session.commit()

    return "", 204


@contacts_bp.patch("/<int:contact_id>/favorite")
def toggle_favorite(contact_id):
    contact = db.get_or_404(Contact, contact_id)
    data = request.get_json(silent=True) or {}

    if "is_favorite" in data:
        contact.is_favorite = data["is_favorite"]
    else:
        contact.is_favorite = not contact.is_favorite

    db.session.commit()

    return jsonify(contact.to_dict()), 200
