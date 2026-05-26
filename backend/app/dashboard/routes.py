from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from sqlalchemy import func

from app.contacts.models import Contact
from app.events.models import AppEvent
from app.extensions import db
from app.groups.models import Group
from app.moderation.models import ModerationAlert
from app.projects.permissions import check_project_access
from app.tasks.models import Task
from app.teams.models import Team
from app.utils.responses import error_response

dashboard_bp = Blueprint("dashboard", __name__)


def _count(model, *filters):
    query = db.session.query(func.count()).select_from(model)
    if filters:
        query = query.filter(*filters)
    return query.scalar() or 0


def _pid_filter(model, project_id):
    """Return a filter for project_id if provided, otherwise empty tuple."""
    if project_id is None:
        return ()
    return (model.project_id == project_id,)


@dashboard_bp.get("/summary")
@jwt_required()
def get_summary():
    raw = request.args.get("project_id")
    if not raw:
        return error_response("project_id é obrigatório", 400)

    access_err = check_project_access(raw)
    if access_err:
        return access_err

    project_id = int(raw)
    pf = lambda m: _pid_filter(m, project_id)

    summary = {
        "total_contacts": _count(Contact, *pf(Contact)),
        "favorite_contacts": _count(Contact, Contact.is_favorite.is_(True), *pf(Contact)),
        "total_teams": _count(Team, *pf(Team)),
        "total_tasks": _count(Task, *pf(Task)),
        "todo_tasks": _count(Task, Task.status == "todo", *pf(Task)),
        "in_progress_tasks": _count(Task, Task.status == "in_progress", *pf(Task)),
        "review_tasks": _count(Task, Task.status == "review", *pf(Task)),
        "done_tasks": _count(Task, Task.status == "done", *pf(Task)),
        "late_tasks": _count(Task, Task.status == "late", *pf(Task)),
        "high_priority_tasks": _count(Task, Task.priority == "high", *pf(Task)),
        "urgent_priority_tasks": _count(Task, Task.priority == "urgent", *pf(Task)),
        "unassigned_tasks": _count(Task, Task.assignee_id.is_(None), *pf(Task)),
        "total_events": _count(AppEvent, *pf(AppEvent)),
        "draft_events": _count(AppEvent, AppEvent.status == "draft", *pf(AppEvent)),
        "scheduled_events": _count(AppEvent, AppEvent.status == "scheduled", *pf(AppEvent)),
        "sent_events": _count(AppEvent, AppEvent.status == "sent", *pf(AppEvent)),
        "total_groups": _count(Group, *pf(Group)),
    }

    return jsonify(summary), 200


@dashboard_bp.get("/reports")
@jwt_required()
def get_reports():
    raw = request.args.get("project_id")
    if not raw:
        return error_response("project_id é obrigatório", 400)

    access_err = check_project_access(raw)
    if access_err:
        return access_err

    project_id = int(raw)
    pf = lambda m: _pid_filter(m, project_id)

    team_filter = [Team.project_id == project_id] if project_id else []
    teams = Team.query.filter(*team_filter).all()
    contacts_by_team = [
        {
            "id": t.id,
            "name": t.name,
            "color": t.color,
            "contact_count": _count(Contact, Contact.team_id == t.id, *pf(Contact)),
        }
        for t in teams
    ]

    return jsonify({
        "total_contacts": _count(Contact, *pf(Contact)),
        "total_tasks": _count(Task, *pf(Task)),
        "todo_tasks": _count(Task, Task.status == "todo", *pf(Task)),
        "in_progress_tasks": _count(Task, Task.status == "in_progress", *pf(Task)),
        "review_tasks": _count(Task, Task.status == "review", *pf(Task)),
        "done_tasks": _count(Task, Task.status == "done", *pf(Task)),
        "late_tasks": _count(Task, Task.status == "late", *pf(Task)),
        "low_priority_tasks": _count(Task, Task.priority == "low", *pf(Task)),
        "medium_priority_tasks": _count(Task, Task.priority == "medium", *pf(Task)),
        "high_priority_tasks": _count(Task, Task.priority == "high", *pf(Task)),
        "urgent_priority_tasks": _count(Task, Task.priority == "urgent", *pf(Task)),
        "total_events": _count(AppEvent, *pf(AppEvent)),
        "total_moderation": _count(ModerationAlert, *pf(ModerationAlert)),
        "pending_moderation": _count(ModerationAlert, ModerationAlert.status == "pending", *pf(ModerationAlert)),
        "resolved_moderation": _count(ModerationAlert, ModerationAlert.status == "resolved", *pf(ModerationAlert)),
        "dismissed_moderation": _count(ModerationAlert, ModerationAlert.status == "dismissed", *pf(ModerationAlert)),
        "contacts_by_team": contacts_by_team,
    }), 200
