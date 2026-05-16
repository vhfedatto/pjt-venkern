from datetime import datetime

from app.contacts.models import Contact
from app.teams.models import Team

from .models import ALLOWED_TASK_PRIORITIES, ALLOWED_TASK_STATUSES, Task


def parse_due_date(value):
    if value in (None, ""):
        return None

    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError as exc:
        raise ValueError("due_date must be a valid ISO 8601 datetime") from exc


def validate_status(value):
    if value not in ALLOWED_TASK_STATUSES:
        raise ValueError(
            f"status must be one of: {', '.join(sorted(ALLOWED_TASK_STATUSES))}"
        )
    return value


def validate_priority(value):
    if value not in ALLOWED_TASK_PRIORITIES:
        raise ValueError(
            f"priority must be one of: {', '.join(sorted(ALLOWED_TASK_PRIORITIES))}"
        )
    return value


def get_assignee(assignee_id):
    if assignee_id in (None, ""):
        return None

    assignee = Contact.query.get(assignee_id)
    if assignee is None:
        raise ValueError("assignee_id does not reference an existing contact")
    return assignee


def get_team(team_id):
    if team_id in (None, ""):
        return None

    team = Team.query.get(team_id)
    if team is None:
        raise ValueError("team_id does not reference an existing team")
    return team


def validate_task_payload(data, partial=False):
    payload = {}
    title_provided = "title" in data
    status_provided = "status" in data
    priority_provided = "priority" in data

    if not partial or title_provided:
        title = (data.get("title") or "").strip()
        if not title:
            raise ValueError("title is required")
        payload["title"] = title

    if not partial or status_provided:
        status = data.get("status")
        if not status:
            raise ValueError("status is required")
        payload["status"] = validate_status(status)

    if not partial or priority_provided:
        priority = data.get("priority")
        if not priority:
            raise ValueError("priority is required")
        payload["priority"] = validate_priority(priority)

    if "description" in data or not partial:
        payload["description"] = data.get("description")

    if "due_date" in data or not partial:
        payload["due_date"] = parse_due_date(data.get("due_date"))

    if "assignee_id" in data or not partial:
        assignee = get_assignee(data.get("assignee_id"))
        payload["assignee_id"] = assignee.id if assignee else None

    if "team_id" in data or not partial:
        team = get_team(data.get("team_id"))
        payload["team_id"] = team.id if team else None

    return payload


def apply_task_filters(query, args, include_status=True):
    status = args.get("status")
    priority = args.get("priority")
    team_id = args.get("team_id")
    assignee_id = args.get("assignee_id")
    search = args.get("search")

    if include_status and status:
        query = query.filter(Task.status == status)

    if priority:
        query = query.filter(Task.priority == priority)

    if team_id:
        query = query.filter(Task.team_id == int(team_id))

    if assignee_id:
        query = query.filter(Task.assignee_id == int(assignee_id))

    if search:
        term = f"%{search}%"
        query = query.filter(
            (Task.title.ilike(term)) |
            (Task.description.ilike(term))
        )

    return query
