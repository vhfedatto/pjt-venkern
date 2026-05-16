from flask import Blueprint, jsonify, request

from app.extensions import db
from .models import Team

teams_bp = Blueprint("teams", __name__)


def _get_team_or_404(team_id):
    team = Team.query.get(team_id)
    if team is None:
        return None, (jsonify({"error": "team not found"}), 404)
    return team, None


@teams_bp.get("")
def list_teams():
    teams = Team.query.order_by(Team.name.asc()).all()
    return jsonify([team.to_dict() for team in teams]), 200


@teams_bp.post("")
def create_team():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()

    if not name:
        return jsonify({"error": "name is required"}), 400

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
        name = (data.get("name") or "").strip()
        if not name:
            return jsonify({"error": "name is required"}), 400
        team.name = name

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
        return jsonify({"error": "cannot delete team with linked contacts"}), 400

    db.session.delete(team)
    db.session.commit()

    return jsonify({"message": "team deleted successfully"}), 200
