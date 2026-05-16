from flask import Blueprint, jsonify, request

from app.extensions import db
from app.utils.responses import error_response
from app.utils.validators import validate_required_fields
from .models import Team

teams_bp = Blueprint("teams", __name__)


def _get_team_or_404(team_id):
    team = Team.query.get(team_id)
    if team is None:
        return None, error_response("Team not found", 404)
    return team, None


@teams_bp.get("")
def list_teams():
    teams = Team.query.order_by(Team.name.asc()).all()
    return jsonify([team.to_dict() for team in teams]), 200


@teams_bp.post("")
def create_team():
    data = request.get_json(silent=True) or {}
    required_error = validate_required_fields(data, ["name"])
    if required_error:
        return error_response(required_error, 400)

    name = data.get("name").strip()

    team = Team(
        name=name,
        description=data.get("description"),
        color=data.get("color"),
    )

    db.session.add(team)
    db.session.commit()

    return jsonify(team.to_dict()), 201


@teams_bp.get("/<int:team_id>")
def get_team(team_id):
    team, error_response = _get_team_or_404(team_id)
    if error_response:
        return error_response

    return jsonify(team.to_dict()), 200


@teams_bp.put("/<int:team_id>")
def update_team(team_id):
    team, error_response = _get_team_or_404(team_id)
    if error_response:
        return error_response

    data = request.get_json(silent=True) or {}

    if "name" in data:
        required_error = validate_required_fields(data, ["name"])
        if required_error:
            return error_response(required_error, 400)
        team.name = data.get("name").strip()

    if "description" in data:
        team.description = data.get("description")

    if "color" in data:
        team.color = data.get("color")

    db.session.commit()

    return jsonify(team.to_dict()), 200


@teams_bp.delete("/<int:team_id>")
def delete_team(team_id):
    team, error_response = _get_team_or_404(team_id)
    if error_response:
        return error_response

    if team.contacts:
        return error_response("Team has linked contacts and cannot be deleted", 400)

    db.session.delete(team)
    db.session.commit()

    return jsonify({"message": "team deleted successfully"}), 200
