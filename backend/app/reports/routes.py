from datetime import datetime, timezone

from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from sqlalchemy import func

from app.extensions import db
from app.utils.responses import error_response
from app.projects.permissions import get_current_user, get_membership, is_super_admin

reports_bp = Blueprint("reports", __name__)


def _require_member(project_id):
    """Return (user, None) if allowed, (None, error_response) if not."""
    user = get_current_user()
    if not user:
        return None, error_response("Usuário não encontrado", 404)
    if is_super_admin(user):
        return user, None
    membership = get_membership(user, project_id)
    if not membership:
        return None, error_response("Acesso negado ao projeto", 403)
    return user, None


# ─── Summary ──────────────────────────────────────────────────────────────────

@reports_bp.get("/<int:project_id>/reports/summary")
@jwt_required()
def summary(project_id):
    user, err = _require_member(project_id)
    if err:
        return err

    from app.contacts.models import Contact
    from app.teams.models import Team
    from app.tasks.models import Task
    from app.events.models import AppEvent
    from app.groups.models import Group, GroupMessage
    from app.chats.models import ChatConversation, ChatMessage
    from app.moderation.models import ModerationAlert

    total_contacts = Contact.query.filter_by(project_id=project_id).count()
    total_teams = Team.query.filter_by(project_id=project_id).count()
    total_tasks = Task.query.filter_by(project_id=project_id).count()
    total_events = AppEvent.query.filter_by(project_id=project_id).count()
    total_groups = Group.query.filter_by(project_id=project_id).count()
    total_moderation = ModerationAlert.query.filter_by(project_id=project_id).count()

    group_ids = db.session.query(Group.id).filter(Group.project_id == project_id).scalar_subquery()
    total_group_messages = db.session.query(func.count(GroupMessage.id)).filter(
        GroupMessage.group_id.in_(group_ids)
    ).scalar() or 0

    conv_ids = db.session.query(ChatConversation.id).filter(
        ChatConversation.project_id == project_id
    ).scalar_subquery()
    total_chat_messages = db.session.query(func.count(ChatMessage.id)).filter(
        ChatMessage.conversation_id.in_(conv_ids)
    ).scalar() or 0

    return jsonify({
        "totalContacts": total_contacts,
        "totalTeams": total_teams,
        "totalTasks": total_tasks,
        "totalEvents": total_events,
        "totalGroups": total_groups,
        "totalMessages": total_group_messages + total_chat_messages,
        "totalModerationAlerts": total_moderation,
    }), 200


# ─── Tasks report ─────────────────────────────────────────────────────────────

@reports_bp.get("/<int:project_id>/reports/tasks")
@jwt_required()
def tasks_report(project_id):
    user, err = _require_member(project_id)
    if err:
        return err

    from app.tasks.models import Task, TASK_STATUSES, TASK_PRIORITIES
    from app.contacts.models import Contact

    now = datetime.now(timezone.utc)

    by_status = []
    for status in TASK_STATUSES:
        count = Task.query.filter_by(project_id=project_id, status=status).count()
        by_status.append({"status": status, "count": count})

    by_priority = []
    for priority in TASK_PRIORITIES:
        count = Task.query.filter_by(project_id=project_id, priority=priority).count()
        by_priority.append({"priority": priority, "count": count})

    assignee_rows = (
        db.session.query(Contact.full_name, func.count(Task.id).label("cnt"))
        .join(Task, Task.assignee_id == Contact.id)
        .filter(Task.project_id == project_id, Task.assignee_id.isnot(None))
        .group_by(Contact.id, Contact.full_name)
        .order_by(func.count(Task.id).desc())
        .limit(10)
        .all()
    )
    by_assignee = [{"name": name, "count": cnt} for name, cnt in assignee_rows]

    overdue = Task.query.filter(
        Task.project_id == project_id,
        Task.due_date < now,
        Task.status != "done",
    ).count()

    completed = Task.query.filter_by(project_id=project_id, status="done").count()

    return jsonify({
        "byStatus": by_status,
        "byPriority": by_priority,
        "byAssignee": by_assignee,
        "overdue": overdue,
        "completed": completed,
    }), 200


# ─── Contacts report ──────────────────────────────────────────────────────────

@reports_bp.get("/<int:project_id>/reports/contacts")
@jwt_required()
def contacts_report(project_id):
    user, err = _require_member(project_id)
    if err:
        return err

    from app.contacts.models import Contact
    from app.teams.models import Team

    team_rows = (
        db.session.query(Team.name, Team.color, func.count(Contact.id).label("cnt"))
        .outerjoin(
            Contact,
            (Contact.team_id == Team.id) & (Contact.project_id == project_id),
        )
        .filter(Team.project_id == project_id)
        .group_by(Team.id, Team.name, Team.color)
        .order_by(func.count(Contact.id).desc())
        .all()
    )
    by_team = [
        {"team": name, "color": color or "#6366f1", "count": cnt}
        for name, color, cnt in team_rows
    ]

    favorites = Contact.query.filter_by(project_id=project_id, is_favorite=True).count()

    origin_rows = (
        db.session.query(Contact.origin, func.count(Contact.id).label("cnt"))
        .filter(Contact.project_id == project_id)
        .group_by(Contact.origin)
        .all()
    )
    by_origin = [
        {"origin": origin or "outro", "count": cnt}
        for origin, cnt in origin_rows
    ]

    month_rows = (
        db.session.query(
            func.to_char(Contact.created_at, "YYYY-MM").label("month"),
            func.count(Contact.id).label("cnt"),
        )
        .filter(Contact.project_id == project_id, Contact.created_at.isnot(None))
        .group_by(func.to_char(Contact.created_at, "YYYY-MM"))
        .order_by(func.to_char(Contact.created_at, "YYYY-MM"))
        .all()
    )
    by_month = [{"month": month, "count": cnt} for month, cnt in month_rows]

    no_team = Contact.query.filter_by(project_id=project_id, team_id=None).count()

    return jsonify({
        "byTeam": by_team,
        "favorites": favorites,
        "byOrigin": by_origin,
        "byMonth": by_month,
        "withoutTeam": no_team,
    }), 200


# ─── Activity report ──────────────────────────────────────────────────────────

@reports_bp.get("/<int:project_id>/reports/activity")
@jwt_required()
def activity_report(project_id):
    user, err = _require_member(project_id)
    if err:
        return err

    from app.contacts.models import Contact
    from app.tasks.models import Task
    from app.events.models import AppEvent
    from app.groups.models import Group, GroupMessage
    from app.chats.models import ChatConversation, ChatMessage

    def by_month_query(model, date_col, extra_filter=None):
        q = db.session.query(
            func.to_char(date_col, "YYYY-MM").label("month"),
            func.count(model.id).label("cnt"),
        )
        if extra_filter is not None:
            q = q.filter(extra_filter)
        return (
            q.group_by(func.to_char(date_col, "YYYY-MM"))
            .order_by(func.to_char(date_col, "YYYY-MM"))
            .all()
        )

    contacts_rows = by_month_query(
        Contact, Contact.created_at,
        extra_filter=(Contact.project_id == project_id),
    )
    tasks_created_rows = by_month_query(
        Task, Task.created_at,
        extra_filter=(Task.project_id == project_id),
    )
    tasks_done_rows = by_month_query(
        Task, Task.updated_at,
        extra_filter=((Task.project_id == project_id) & (Task.status == "done")),
    )
    events_rows = by_month_query(
        AppEvent, AppEvent.created_at,
        extra_filter=((AppEvent.project_id == project_id) & (AppEvent.status == "sent")),
    )

    group_ids_sub = (
        db.session.query(Group.id).filter(Group.project_id == project_id).scalar_subquery()
    )
    group_msg_rows = (
        db.session.query(
            func.to_char(GroupMessage.timestamp, "YYYY-MM").label("month"),
            func.count(GroupMessage.id).label("cnt"),
        )
        .filter(GroupMessage.group_id.in_(group_ids_sub))
        .group_by(func.to_char(GroupMessage.timestamp, "YYYY-MM"))
        .all()
    )

    conv_ids_sub = (
        db.session.query(ChatConversation.id)
        .filter(ChatConversation.project_id == project_id)
        .scalar_subquery()
    )
    chat_msg_rows = (
        db.session.query(
            func.to_char(ChatMessage.timestamp, "YYYY-MM").label("month"),
            func.count(ChatMessage.id).label("cnt"),
        )
        .filter(ChatMessage.conversation_id.in_(conv_ids_sub))
        .group_by(func.to_char(ChatMessage.timestamp, "YYYY-MM"))
        .all()
    )

    # Merge into one dict per month
    months: dict[str, dict] = {}

    def add(rows, key):
        for month, cnt in rows:
            if month not in months:
                months[month] = {
                    "month": month,
                    "contactsCreated": 0,
                    "tasksCreated": 0,
                    "tasksCompleted": 0,
                    "eventsSent": 0,
                    "messagesSent": 0,
                }
            months[month][key] += cnt

    add(contacts_rows, "contactsCreated")
    add(tasks_created_rows, "tasksCreated")
    add(tasks_done_rows, "tasksCompleted")
    add(events_rows, "eventsSent")
    add(group_msg_rows, "messagesSent")
    add(chat_msg_rows, "messagesSent")

    result = sorted(months.values(), key=lambda x: x["month"])
    return jsonify(result), 200
