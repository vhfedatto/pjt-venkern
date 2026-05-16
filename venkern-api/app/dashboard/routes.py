from flask import Blueprint, jsonify
from sqlalchemy import func

from app.contacts.models import Contact
from app.extensions import db
from app.tasks.models import Task
from app.teams.models import Team

dashboard_bp = Blueprint("dashboard", __name__)


def _count(model, *filters):
    query = db.session.query(func.count()).select_from(model)
    if filters:
        query = query.filter(*filters)
    return query.scalar() or 0


@dashboard_bp.get("/summary")
def get_summary():
    summary = {
        "total_contacts": _count(Contact),
        "favorite_contacts": _count(Contact, Contact.is_favorite.is_(True)),
        "total_teams": _count(Team),
        "total_tasks": _count(Task),
        "todo_tasks": _count(Task, Task.status == "todo"),
        "in_progress_tasks": _count(Task, Task.status == "in_progress"),
        "review_tasks": _count(Task, Task.status == "review"),
        "done_tasks": _count(Task, Task.status == "done"),
        "late_tasks": _count(Task, Task.status == "late"),
        "high_priority_tasks": _count(Task, Task.priority == "high"),
        "urgent_priority_tasks": _count(Task, Task.priority == "urgent"),
        "unassigned_tasks": _count(Task, Task.assignee_id.is_(None)),
    }

    return jsonify(summary), 200
