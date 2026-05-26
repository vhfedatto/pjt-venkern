"""Flask-SocketIO event handlers for real-time chat."""
from datetime import datetime, timezone

from flask import request as flask_request
from flask_socketio import emit, join_room, leave_room, disconnect

from app.extensions import db, socketio
from app.auth.models import User
from app.contacts.models import Contact
from app.chats.models import ChatConversation, ChatMessage
from app.groups.models import Group, GroupMessage

from .auth import get_user_from_socket_token

MAX_MESSAGE_LENGTH = 4000


# ── Internal helpers ─────────────────────────────────────────────────────────

def _current_user() -> User | None:
    """Return User stored in socket session, or None."""
    uid = getattr(flask_request, "_ws_user_id", None)
    if uid is None:
        return None
    return User.query.get(uid)


def _find_contact_for_user(user: User, contact_ids: list[int]) -> Contact | None:
    """Return the Contact whose email matches *user* and whose id is in *contact_ids*."""
    return (
        Contact.query.filter(
            Contact.email == user.email,
            Contact.id.in_(contact_ids),
        ).first()
    )


def _user_contact_in_group(user: User, group: Group) -> Contact | None:
    """Return the group member whose email matches *user*, or None."""
    for member in group.members:
        if member.email == user.email:
            return member
    return None


# ── connect / disconnect ─────────────────────────────────────────────────────

@socketio.on("connect")
def on_connect(auth):
    token = (auth or {}).get("token")
    user = get_user_from_socket_token(token)

    if user is None or not user.is_active:
        disconnect()
        return False  # reject connection

    # Attach user id to this request context for other handlers
    flask_request._ws_user_id = user.id  # type: ignore[attr-defined]

    join_room(f"user:{user.id}")
    emit("connected", {"userId": user.id, "name": user.name})


@socketio.on("disconnect")
def on_disconnect():
    pass  # rooms are cleaned up automatically


# ── Private chat ──────────────────────────────────────────────────────────────

@socketio.on("join_conversation")
def on_join_conversation(data):
    user = _current_user()
    if user is None:
        return

    conv_id = (data or {}).get("conversationId")
    if not conv_id:
        emit("error", {"message": "conversationId obrigatório"})
        return

    conv = ChatConversation.query.get(int(conv_id))
    if conv is None:
        emit("error", {"message": "Conversa não encontrada"})
        return

    contact = _find_contact_for_user(user, [conv.participant_a, conv.participant_b])
    if contact is None:
        emit("error", {"message": "Acesso negado a esta conversa"})
        return

    join_room(f"conversation:{conv_id}")
    emit("joined_conversation", {"conversationId": conv_id})


@socketio.on("leave_conversation")
def on_leave_conversation(data):
    conv_id = (data or {}).get("conversationId")
    if conv_id:
        leave_room(f"conversation:{conv_id}")


@socketio.on("send_private_message")
def on_send_private_message(data):
    user = _current_user()
    if user is None:
        return

    data = data or {}
    conv_id = data.get("conversationId")
    content = (data.get("content") or "").strip()
    msg_type = data.get("messageType", "TEXT").lower()

    if not conv_id or not content:
        emit("error", {"message": "conversationId e content são obrigatórios"})
        return
    if len(content) > MAX_MESSAGE_LENGTH:
        emit("error", {"message": f"Mensagem muito longa (máx {MAX_MESSAGE_LENGTH} chars)"})
        return

    conv = ChatConversation.query.get(int(conv_id))
    if conv is None:
        emit("error", {"message": "Conversa não encontrada"})
        return

    contact = _find_contact_for_user(user, [conv.participant_a, conv.participant_b])
    if contact is None:
        emit("error", {"message": "Você não participa desta conversa"})
        return

    # Persist
    msg = ChatMessage(
        conversation_id=conv.id,
        sender_id=contact.id,
        content=content,
        type=msg_type if msg_type in ("text", "image") else "text",
    )
    conv.last_activity = datetime.now(timezone.utc)
    db.session.add(msg)
    db.session.commit()

    payload = {
        "id": msg.id,
        "conversationId": conv.id,
        "senderId": contact.id,
        "senderName": user.name,
        "content": msg.content,
        "messageType": msg.type,
        "blocked": msg.blocked,
        "createdAt": msg.timestamp.isoformat(),
    }
    socketio.emit("private_message:new", payload, to=f"conversation:{conv_id}")


@socketio.on("typing")
def on_typing(data):
    user = _current_user()
    if user is None:
        return

    data = data or {}
    conv_id = data.get("conversationId")
    is_typing = bool(data.get("isTyping", False))

    if not conv_id:
        return

    # Broadcast to others in the room (skip_sid excludes the sender)
    socketio.emit(
        "chat:typing",
        {"conversationId": conv_id, "userId": user.id, "name": user.name, "isTyping": is_typing},
        to=f"conversation:{conv_id}",
        skip_sid=flask_request.sid,
    )


@socketio.on("mark_read")
def on_mark_read(data):
    user = _current_user()
    if user is None:
        return

    conv_id = (data or {}).get("conversationId")
    if not conv_id:
        return

    socketio.emit(
        "chat:read",
        {"conversationId": conv_id, "userId": user.id},
        to=f"conversation:{conv_id}",
        skip_sid=flask_request.sid,
    )


# ── Group chat ────────────────────────────────────────────────────────────────

@socketio.on("join_group")
def on_join_group(data):
    user = _current_user()
    if user is None:
        return

    group_id = (data or {}).get("groupId")
    if not group_id:
        emit("error", {"message": "groupId obrigatório"})
        return

    group = Group.query.get(int(group_id))
    if group is None:
        emit("error", {"message": "Grupo não encontrado"})
        return

    # Admins can join any group; others need membership
    is_admin = User.query.get(user.id) and User.query.get(user.id).role == "admin"
    contact = _user_contact_in_group(user, group)
    if not is_admin and contact is None:
        emit("error", {"message": "Você não é membro deste grupo"})
        return

    join_room(f"group:{group_id}")
    emit("joined_group", {"groupId": group_id})


@socketio.on("leave_group")
def on_leave_group(data):
    group_id = (data or {}).get("groupId")
    if group_id:
        leave_room(f"group:{group_id}")


@socketio.on("send_group_message")
def on_send_group_message(data):
    user = _current_user()
    if user is None:
        return

    data = data or {}
    group_id = data.get("groupId")
    content = (data.get("content") or "").strip()
    msg_type = data.get("messageType", "TEXT").lower()

    if not group_id or not content:
        emit("error", {"message": "groupId e content são obrigatórios"})
        return
    if len(content) > MAX_MESSAGE_LENGTH:
        emit("error", {"message": f"Mensagem muito longa (máx {MAX_MESSAGE_LENGTH} chars)"})
        return

    group = Group.query.get(int(group_id))
    if group is None:
        emit("error", {"message": "Grupo não encontrado"})
        return

    is_admin = user.role == "admin"
    contact = _user_contact_in_group(user, group)
    if not is_admin and contact is None:
        emit("error", {"message": "Você não é membro deste grupo"})
        return

    # If admin without a contact in the group, use any contact linked to this user
    if contact is None:
        contact = Contact.query.filter_by(email=user.email).first()
    if contact is None:
        emit("error", {"message": "Nenhum contato associado ao seu usuário"})
        return

    # Persist
    msg = GroupMessage(
        group_id=group.id,
        sender_id=contact.id,
        content=content,
        type=msg_type if msg_type in ("text", "image") else "text",
    )
    group.last_activity = datetime.now(timezone.utc)
    db.session.add(msg)
    db.session.commit()

    payload = {
        "id": msg.id,
        "groupId": group.id,
        "senderId": contact.id,
        "senderName": user.name,
        "content": msg.content,
        "messageType": msg.type,
        "blocked": msg.blocked,
        "createdAt": msg.timestamp.isoformat(),
    }
    socketio.emit("group_message:new", payload, to=f"group:{group_id}")
