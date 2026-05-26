from flask import Blueprint, jsonify, request

from app.extensions import db
from app.utils.responses import error_response
from app.utils.validators import validate_required_fields
from app.projects.permissions import check_project_access

from .models import MODERATION_CONTEXTS, MODERATION_STATUSES, ModerationAlert

moderation_bp = Blueprint("moderation", __name__)

ALLOWED_STATUSES = set(MODERATION_STATUSES)
ALLOWED_CONTEXTS = set(MODERATION_CONTEXTS)


def _get_or_404(alert_id):
    alert = db.session.get(ModerationAlert, alert_id)
    if alert is None:
        return None, error_response("Alert not found", 404)
    return alert, None


@moderation_bp.get("")
def list_alerts():
    status = request.args.get("status")
    project_id = request.args.get("project_id")
    query = ModerationAlert.query
    if project_id:
        access_err = check_project_access(project_id)
        if access_err:
            return access_err
        try:
            query = query.filter(ModerationAlert.project_id == int(project_id))
        except (ValueError, TypeError):
            return error_response("project_id inválido", 400)
    if status:
        if status not in ALLOWED_STATUSES:
            return error_response(f"status must be one of: {', '.join(sorted(ALLOWED_STATUSES))}", 400)
        query = query.filter(ModerationAlert.status == status)
    alerts = query.order_by(ModerationAlert.timestamp.desc()).all()
    return jsonify([a.to_dict() for a in alerts]), 200


@moderation_bp.post("")
def create_alert():
    data = request.get_json(silent=True) or {}
    required_error = validate_required_fields(data, ["user_id", "context", "context_id", "content"])
    if required_error:
        return error_response(required_error, 400)

    context = data["context"]
    if context not in ALLOWED_CONTEXTS:
        return error_response(f"context must be one of: {', '.join(sorted(ALLOWED_CONTEXTS))}", 400)

    alert = ModerationAlert(
        user_id=data["user_id"],
        context=context,
        context_id=str(data["context_id"]),
        context_name=data.get("context_name"),
        content=data["content"],
        status=data.get("status", "pending"),
        project_id=data.get("project_id"),
    )
    db.session.add(alert)
    db.session.commit()
    return jsonify(alert.to_dict()), 201


@moderation_bp.get("/<int:alert_id>")
def get_alert(alert_id):
    alert, err = _get_or_404(alert_id)
    if err:
        return err
    return jsonify(alert.to_dict()), 200


@moderation_bp.patch("/<int:alert_id>/resolve")
def resolve_alert(alert_id):
    alert, err = _get_or_404(alert_id)
    if err:
        return err
    alert.status = "resolved"
    db.session.commit()
    return jsonify(alert.to_dict()), 200


@moderation_bp.patch("/<int:alert_id>/dismiss")
def dismiss_alert(alert_id):
    alert, err = _get_or_404(alert_id)
    if err:
        return err
    alert.status = "dismissed"
    db.session.commit()
    return jsonify(alert.to_dict()), 200


@moderation_bp.delete("/<int:alert_id>")
def delete_alert(alert_id):
    alert, err = _get_or_404(alert_id)
    if err:
        return err
    db.session.delete(alert)
    db.session.commit()
    return jsonify({"message": "alert deleted"}), 200
