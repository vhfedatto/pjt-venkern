from datetime import datetime, timezone

from flask import Blueprint, jsonify, request

from app.contacts.models import Contact
from app.auth.models import User
from app.extensions import db
from app.projects.permissions import check_project_access
from app.utils.responses import error_response
from app.utils.validators import validate_required_fields

from .models import ChatConversation, ChatMessage

chats_bp = Blueprint("chats", __name__)


def _has_platform_account(contact: Contact) -> bool:
    return User.query.filter_by(email=contact.email).first() is not None


def _get_or_404(chat_id):
    chat = ChatConversation.query.get(chat_id)
    if chat is None:
        return None, error_response("Conversation not found", 404)
    return chat, None


@chats_bp.get("")
def list_conversations():
    """Optionally filter by participant_id (returns all chats involving that contact)."""
    participant_id = request.args.get("participant_id")
    project_id = request.args.get("project_id")
    query = ChatConversation.query

    if project_id:
        access_err = check_project_access(project_id)
        if access_err:
            return access_err
        try:
            query = query.filter(ChatConversation.project_id == int(project_id))
        except (ValueError, TypeError):
            return error_response("project_id inválido", 400)

    if participant_id:
        try:
            pid = int(participant_id)
        except (ValueError, TypeError):
            return error_response("participant_id inválido", 400)
        query = query.filter(
            (ChatConversation.participant_a == pid) |
            (ChatConversation.participant_b == pid)
        )

    chats = query.order_by(ChatConversation.last_activity.desc()).all()
    return jsonify([c.to_dict(include_messages=False) for c in chats]), 200


@chats_bp.post("")
def create_conversation():
    data = request.get_json(silent=True) or {}
    required_error = validate_required_fields(data, ["participant_a", "participant_b"])
    if required_error:
        return error_response(required_error, 400)

    pa = int(data["participant_a"])
    pb = int(data["participant_b"])

    if pa == pb:
        return error_response("Participants must be different contacts", 400)

    contact_a = Contact.query.get(pa)
    contact_b = Contact.query.get(pb)
    if contact_a is None or contact_b is None:
        return error_response("One or both participants not found", 404)

    if not _has_platform_account(contact_a) or not _has_platform_account(contact_b):
        return error_response("Both participants must have a platform account", 400)

    # Check if conversation already exists
    existing = ChatConversation.query.filter(
        ((ChatConversation.participant_a == pa) & (ChatConversation.participant_b == pb)) |
        ((ChatConversation.participant_a == pb) & (ChatConversation.participant_b == pa))
    ).first()

    if existing:
        return jsonify(existing.to_dict()), 200

    conv = ChatConversation(
        participant_a=pa,
        participant_b=pb,
        project_id=data.get("project_id"),
        last_activity=datetime.now(timezone.utc),
    )
    db.session.add(conv)
    db.session.commit()
    return jsonify(conv.to_dict()), 201


@chats_bp.get("/<int:chat_id>")
def get_conversation(chat_id):
    chat, err = _get_or_404(chat_id)
    if err:
        return err
    return jsonify(chat.to_dict()), 200


@chats_bp.get("/<int:chat_id>/messages")
def list_messages(chat_id):
    _, err = _get_or_404(chat_id)
    if err:
        return err
    messages = (
        ChatMessage.query
        .filter_by(conversation_id=chat_id)
        .order_by(ChatMessage.timestamp.asc())
        .all()
    )
    return jsonify([m.to_dict() for m in messages]), 200


@chats_bp.post("/<int:chat_id>/messages")
def send_message(chat_id):
    chat, err = _get_or_404(chat_id)
    if err:
        return err

    data = request.get_json(silent=True) or {}
    required_error = validate_required_fields(data, ["sender_id", "content"])
    if required_error:
        return error_response(required_error, 400)

    sender_contact = Contact.query.get(int(data["sender_id"]))
    if sender_contact is None:
        return error_response("Sender contact not found", 404)

    if sender_contact.id not in (chat.participant_a, chat.participant_b):
        return error_response("Sender must be a participant of this conversation", 400)

    if not _has_platform_account(sender_contact):
        return error_response("Sender must have a platform account", 400)

    msg_type = data.get("type", "text")
    blocked = data.get("blocked", False)

    message = ChatMessage(
        conversation_id=chat_id,
        sender_id=data["sender_id"],
        content=data["content"],
        type=msg_type,
        blocked=blocked,
        image_url=data.get("image_url"),
    )

    chat.last_activity = datetime.now(timezone.utc)
    db.session.add(message)
    db.session.commit()
    return jsonify(message.to_dict()), 201
