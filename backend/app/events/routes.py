from datetime import date, datetime, timezone

from flask import Blueprint, jsonify, request

from app.extensions import db
from app.utils.responses import error_response, paginate_query
from app.utils.validators import validate_required_fields
from app.projects.permissions import check_project_access

from .models import EVENT_STATUSES, AppEvent

events_bp = Blueprint("events", __name__)

ALLOWED_STATUSES = set(EVENT_STATUSES)


def _get_or_404(event_id):
    event = db.session.get(AppEvent, event_id)
    if event is None:
        return None, error_response("Event not found", 404)
    return event, None


def _parse_date(value):
    if not value:
        return None
    try:
        parsed = date.fromisoformat(value)
    except ValueError:
        raise ValueError("date must be YYYY-MM-DD")
    if parsed < date.today():
        raise ValueError("A data do evento não pode ser anterior à data atual")
    return parsed


@events_bp.get("")
def list_events():
    status = request.args.get("status")
    project_id = request.args.get("project_id")
    query = AppEvent.query
    if project_id:
        access_err = check_project_access(project_id)
        if access_err:
            return access_err
        try:
            query = query.filter(AppEvent.project_id == int(project_id))
        except (ValueError, TypeError):
            return error_response("project_id inválido", 400)
    if status:
        if status not in ALLOWED_STATUSES:
            return error_response(f"status must be one of: {', '.join(sorted(ALLOWED_STATUSES))}", 400)
        query = query.filter(AppEvent.status == status)
    events = query.order_by(AppEvent.date.asc())
    return paginate_query(events, lambda e: e.to_dict())


@events_bp.post("")
def create_event():
    data = request.get_json(silent=True) or {}
    required_error = validate_required_fields(data, ["title", "date"])
    if required_error:
        return error_response(required_error, 400)

    try:
        event_date = _parse_date(data["date"])
    except ValueError as exc:
        return error_response(str(exc), 400)

    status = data.get("status", "draft")
    if status not in ALLOWED_STATUSES:
        return error_response(f"status must be one of: {', '.join(sorted(ALLOWED_STATUSES))}", 400)

    event = AppEvent(
        title=data["title"].strip(),
        description=data.get("description"),
        date=event_date,
        time=data.get("time"),
        location=data.get("location"),
        banner_url=data.get("banner_url") or data.get("bannerUrl"),
        target_audience=data.get("target_audience") or data.get("targetAudience") or ["all"],
        status=status,
        project_id=data.get("project_id"),
    )
    db.session.add(event)
    db.session.commit()
    return jsonify(event.to_dict()), 201


@events_bp.get("/<int:event_id>")
def get_event(event_id):
    event, err = _get_or_404(event_id)
    if err:
        return err
    return jsonify(event.to_dict()), 200


@events_bp.put("/<int:event_id>")
def update_event(event_id):
    event, err = _get_or_404(event_id)
    if err:
        return err

    data = request.get_json(silent=True) or {}

    if "title" in data:
        if not data["title"]:
            return error_response("title is required", 400)
        event.title = data["title"].strip()

    if "description" in data:
        event.description = data["description"]

    if "date" in data:
        try:
            event.date = _parse_date(data["date"])
        except ValueError as exc:
            return error_response(str(exc), 400)

    if "time" in data:
        event.time = data["time"]

    if "location" in data:
        event.location = data["location"]

    if "banner_url" in data or "bannerUrl" in data:
        event.banner_url = data.get("banner_url") or data.get("bannerUrl")

    if "target_audience" in data or "targetAudience" in data:
        event.target_audience = data.get("target_audience") or data.get("targetAudience")

    if "status" in data:
        if data["status"] not in ALLOWED_STATUSES:
            return error_response(f"status must be one of: {', '.join(sorted(ALLOWED_STATUSES))}", 400)
        event.status = data["status"]

    db.session.commit()
    return jsonify(event.to_dict()), 200


@events_bp.delete("/<int:event_id>")
def delete_event(event_id):
    event, err = _get_or_404(event_id)
    if err:
        return err
    db.session.delete(event)
    db.session.commit()
    return jsonify({"message": "event deleted successfully"}), 200


@events_bp.patch("/<int:event_id>/send")
def send_event(event_id):
    event, err = _get_or_404(event_id)
    if err:
        return err
    event.status = "sent"
    event.sent_at = datetime.now(timezone.utc)

    if event.project_id:
        # 1 — broadcast to all project groups
        from app.groups.models import Group, GroupMessage
        from app.contacts.models import Contact
        from app.chats.models import ChatConversation, ChatMessage

        groups = Group.query.filter_by(project_id=event.project_id).all()
        system_contact = Contact.query.filter_by(project_id=event.project_id).first()

        event_banner = (
            f"[EVENTO] {event.title} — "
            f"{event.date.strftime('%d/%m/%Y') if event.date else ''}"
            + (f" às {event.time}" if event.time else "")
            + (f" | {event.location}" if event.location else "")
        )

        if system_contact:
            for group in groups:
                msg = GroupMessage(
                    group_id=group.id,
                    sender_id=system_contact.id,
                    content=event_banner,
                    type="event_banner",
                )
                db.session.add(msg)
                group.last_activity = datetime.now(timezone.utc)

            # 2 — send to existing private chats of all project contacts
            project_contact_ids = {
                c.id for c in Contact.query.filter_by(project_id=event.project_id).all()
            }
            seen_convs: set[int] = set()
            for contact_id in project_contact_ids:
                convs = ChatConversation.query.filter(
                    (ChatConversation.participant_a == contact_id) |
                    (ChatConversation.participant_b == contact_id)
                ).all()
                for conv in convs:
                    if conv.id in seen_convs:
                        continue
                    seen_convs.add(conv.id)
                    chat_msg = ChatMessage(
                        conversation_id=conv.id,
                        sender_id=system_contact.id,
                        content=event_banner,
                        type="event_banner",
                    )
                    db.session.add(chat_msg)
                    conv.last_activity = datetime.now(timezone.utc)

    db.session.commit()
    return jsonify(event.to_dict()), 200
