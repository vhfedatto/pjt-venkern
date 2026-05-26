from datetime import datetime, timezone

from flask import Blueprint, jsonify, request

from app.extensions import db
from app.utils.responses import error_response, paginate_query
from app.projects.permissions import check_project_access

from .models import TASK_STATUSES, Task
from .services import apply_task_filters, validate_status, validate_task_payload

tasks_bp = Blueprint("tasks", __name__)


def _get_task_or_404(task_id):
    task = Task.query.get(task_id)
    if task is None:
        return None, error_response("Task not found", 404)
    return task, None


@tasks_bp.get("")
def list_tasks():
    project_id = request.args.get("project_id")
    if project_id:
        access_err = check_project_access(project_id)
        if access_err:
            return access_err
    try:
        query = apply_task_filters(Task.query, request.args)
    except ValueError as exc:
        return error_response(str(exc), 400)

    tasks = query.order_by(Task.created_at.desc())

    return paginate_query(tasks, lambda t: t.to_dict())


@tasks_bp.get("/kanban")
def get_kanban():
    project_id = request.args.get("project_id")
    if project_id:
        access_err = check_project_access(project_id)
        if access_err:
            return access_err
    try:
        query = apply_task_filters(Task.query, request.args, include_status=False)
    except ValueError as exc:
        return error_response(str(exc), 400)

    tasks = query.order_by(Task.created_at.desc()).all()

    kanban = {status: [] for status in TASK_STATUSES}

    for task in tasks:
        if task.status in kanban:
            kanban[task.status].append(task.to_dict())

    return jsonify(kanban), 200


@tasks_bp.post("")
def create_task():
    data = request.get_json(silent=True) or {}

    try:
        payload = validate_task_payload(data, partial=False)
    except ValueError as exc:
        return error_response(str(exc), 400)

    task = Task(**payload)
    db.session.add(task)
    db.session.commit()

    return jsonify(task.to_dict()), 201


@tasks_bp.get("/<int:task_id>")
def get_task(task_id):
    task, err = _get_task_or_404(task_id)
    if err:
        return err

    return jsonify(task.to_dict()), 200


@tasks_bp.put("/<int:task_id>")
def update_task(task_id):
    task, err = _get_task_or_404(task_id)
    if err:
        return err

    data = request.get_json(silent=True) or {}

    try:
        payload = validate_task_payload(data, partial=True)
    except ValueError as exc:
        return error_response(str(exc), 400)

    for field, value in payload.items():
        setattr(task, field, value)

    db.session.commit()

    return jsonify(task.to_dict()), 200


@tasks_bp.delete("/<int:task_id>")
def delete_task(task_id):
    task, err = _get_task_or_404(task_id)
    if err:
        return err

    db.session.delete(task)
    db.session.commit()

    return jsonify({"message": "task deleted successfully"}), 200


@tasks_bp.patch("/<int:task_id>/status")
def update_task_status(task_id):
    task, err = _get_task_or_404(task_id)
    if err:
        return err

    data = request.get_json(silent=True) or {}
    status = data.get("status")

    if not status:
        return error_response("status is required", 400)

    try:
        task.status = validate_status(status)
    except ValueError as exc:
        return error_response(str(exc), 400)

    db.session.commit()

    return jsonify(task.to_dict()), 200


# ── Kanban workflow endpoints ─────────────────────────────────────────────────

@tasks_bp.patch("/<int:task_id>/accept")
def accept_task(task_id):
    """Assignee accepts the task → moves to in_progress."""
    task, err = _get_task_or_404(task_id)
    if err:
        return err

    task.status = "in_progress"
    task.accepted_at = datetime.now(timezone.utc)
    db.session.commit()
    return jsonify(task.to_dict()), 200


@tasks_bp.post("/<int:task_id>/complete")
def complete_task(task_id):
    """Assignee marks task complete (optional file + note) → moves to review.
    Notifies project admins via a group message."""
    import os
    from werkzeug.utils import secure_filename

    task, err = _get_task_or_404(task_id)
    if err:
        return err

    note = request.form.get("note", "")
    file_url = None

    uploaded = request.files.get("file")
    if uploaded and uploaded.filename:
        filename = secure_filename(uploaded.filename)
        upload_dir = os.path.join(os.path.dirname(__file__), "..", "..", "uploads")
        os.makedirs(upload_dir, exist_ok=True)
        save_path = os.path.join(upload_dir, filename)
        uploaded.save(save_path)
        file_url = f"/uploads/{filename}"

    task.status = "review"
    task.completion_note = note
    task.completion_file_url = file_url
    db.session.commit()

    # Notify admins: post a message in the first project group (or all groups)
    _notify_review(task)

    return jsonify(task.to_dict()), 200


@tasks_bp.patch("/<int:task_id>/approve")
def approve_task(task_id):
    """Admin/tech leader approves reviewed task → moves to done."""
    task, err = _get_task_or_404(task_id)
    if err:
        return err

    task.status = "done"
    db.session.commit()
    return jsonify(task.to_dict()), 200


def _notify_review(task: Task):
    """Post an event_banner-style notification in the task's project groups."""
    if not task.project_id:
        return
    try:
        from app.groups.models import Group, GroupMessage
        from app.contacts.models import Contact

        groups = Group.query.filter_by(project_id=task.project_id).all()
        if not groups:
            return

        # Use the task assignee as sender, fall back to any project contact
        sender_id = task.assignee_id
        if sender_id is None:
            fallback = Contact.query.filter_by(project_id=task.project_id).first()
            if fallback is None:
                return
            sender_id = fallback.id

        content = (
            f"[REVISAO] A tarefa '{task.title}' foi enviada para revisao"
            + (f" por {task.assignee.full_name}" if task.assignee else "")
            + (f': "{task.completion_note}"' if task.completion_note else "")
        )

        for group in groups:
            msg = GroupMessage(
                group_id=group.id,
                sender_id=sender_id,
                content=content,
                type="event_banner",
            )
            db.session.add(msg)
        db.session.commit()
    except Exception:
        pass  # never break the main flow
