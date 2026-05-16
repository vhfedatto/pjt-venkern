from flask import Blueprint, jsonify, request

from app.extensions import db

from .models import TASK_STATUSES, Task
from .services import apply_task_filters, validate_status, validate_task_payload

tasks_bp = Blueprint("tasks", __name__)


def _get_task_or_404(task_id):
    task = Task.query.get(task_id)
    if task is None:
        return None, (jsonify({"error": "task not found"}), 404)
    return task, None


@tasks_bp.get("")
def list_tasks():
    query = apply_task_filters(Task.query, request.args)

    tasks = query.order_by(Task.created_at.desc()).all()

    return jsonify([task.to_dict() for task in tasks]), 200


@tasks_bp.get("/kanban")
def get_kanban():
    query = apply_task_filters(Task.query, request.args, include_status=False)
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
        return jsonify({"error": str(exc)}), 400

    task = Task(**payload)
    db.session.add(task)
    db.session.commit()

    return jsonify(task.to_dict()), 201


@tasks_bp.get("/<int:task_id>")
def get_task(task_id):
    task, error_response = _get_task_or_404(task_id)
    if error_response:
        return error_response

    return jsonify(task.to_dict()), 200


@tasks_bp.put("/<int:task_id>")
def update_task(task_id):
    task, error_response = _get_task_or_404(task_id)
    if error_response:
        return error_response

    data = request.get_json(silent=True) or {}

    try:
        payload = validate_task_payload(data, partial=False)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400

    for field, value in payload.items():
        setattr(task, field, value)

    db.session.commit()

    return jsonify(task.to_dict()), 200


@tasks_bp.delete("/<int:task_id>")
def delete_task(task_id):
    task, error_response = _get_task_or_404(task_id)
    if error_response:
        return error_response

    db.session.delete(task)
    db.session.commit()

    return jsonify({"message": "task deleted successfully"}), 200


@tasks_bp.patch("/<int:task_id>/status")
def update_task_status(task_id):
    task, error_response = _get_task_or_404(task_id)
    if error_response:
        return error_response

    data = request.get_json(silent=True) or {}
    status = data.get("status")

    if not status:
        return jsonify({"error": "status is required"}), 400

    try:
        task.status = validate_status(status)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400

    db.session.commit()

    return jsonify(task.to_dict()), 200
