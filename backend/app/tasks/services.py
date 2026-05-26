from datetime import datetime, timezone

from app.contacts.models import Contact
from app.extensions import db
from app.teams.models import Team
from app.utils.validators import (
    parse_int,
    validate_priority as validate_priority_value,
    validate_required_fields,
    validate_status as validate_status_value,
)

from .models import ALLOWED_TASK_PRIORITIES, ALLOWED_TASK_STATUSES, Task


def parse_due_date(value):
    if value in (None, ""):
        return None

    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError as exc:
        raise ValueError("due_date must be a valid ISO 8601 datetime") from exc
    today = datetime.now(timezone.utc).date() if parsed.tzinfo is not None else datetime.now().date()
    if parsed.date() < today:
        raise ValueError("A data da task não pode ser anterior à data atual")
    return parsed


def validate_status(value):
    error = validate_status_value(value, ALLOWED_TASK_STATUSES)
    if error:
        raise ValueError(error)
    return value


def validate_priority(value):
    error = validate_priority_value(value, ALLOWED_TASK_PRIORITIES)
    if error:
        raise ValueError(error)
    return value


def get_assignee(assignee_id):
    if assignee_id in (None, ""):
        return None

    assignee = db.session.get(Contact, parse_int(assignee_id, "assignee_id"))
    if assignee is None:
        raise ValueError("assignee_id does not reference an existing contact")
    return assignee


def get_team(team_id):
    if team_id in (None, ""):
        return None

    team = db.session.get(Team, parse_int(team_id, "team_id"))
    if team is None:
        raise ValueError("team_id does not reference an existing team")
    return team


def validate_task_payload(data, partial=False):
    payload = {}
    title_provided = "title" in data
    status_provided = "status" in data
    priority_provided = "priority" in data

    if not partial or title_provided:
        error = validate_required_fields(data, ["title"])
        if error:
            raise ValueError(error)
        title = data.get("title").strip()
        payload["title"] = title

    if not partial or status_provided:
        error = validate_required_fields(data, ["status"])
        if error:
            raise ValueError(error)
        status = data.get("status")
        payload["status"] = validate_status(status)

    if not partial or priority_provided:
        error = validate_required_fields(data, ["priority"])
        if error:
            raise ValueError(error)
        priority = data.get("priority")
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

    if "tags" in data or not partial:
        tags = data.get("tags")
        payload["tags"] = tags if isinstance(tags, list) else []

    if "project_id" in data or not partial:
        payload["project_id"] = data.get("project_id")

    return payload


def apply_task_filters(query, args, include_status=True):
    status = args.get("status")
    priority = args.get("priority")
    team_id = args.get("team_id")
    assignee_id = args.get("assignee_id")
    search = args.get("search")
    project_id = args.get("project_id")

    if project_id:
        query = query.filter(Task.project_id == parse_int(project_id, "project_id"))

    if include_status and status:
        query = query.filter(Task.status == status)

    if priority:
        query = query.filter(Task.priority == priority)

    if team_id:
        query = query.filter(Task.team_id == parse_int(team_id, "team_id"))

    if assignee_id:
        query = query.filter(Task.assignee_id == parse_int(assignee_id, "assignee_id"))

    if search:
        term = f"%{search}%"
        query = query.filter(
            (Task.title.ilike(term)) |
            (Task.description.ilike(term))
        )

    return query
