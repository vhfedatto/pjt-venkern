from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from sqlalchemy.exc import IntegrityError

from app.extensions import db
from app.auth.models import User
from app.utils.responses import error_response

users_bp = Blueprint("users", __name__)


def _mask_email(email: str) -> str:
    """Partially hide email for privacy in search results."""
    if "@" not in email:
        return email
    local, domain = email.split("@", 1)
    visible = local[:2] if len(local) >= 2 else local
    return f"{visible}***@{domain}"


@users_bp.route("/search", methods=["GET"])
@jwt_required()
def search_users():
    """Search users by username or name. Returns masked email for privacy."""
    q = (
        request.args.get("q") or
        request.args.get("username") or
        ""
    ).strip()

    if not q or len(q) < 2:
        return jsonify([]), 200

    like = f"%{q}%"
    results = (
        User.query
        .filter(
            db.or_(
                User.username.ilike(like),
                User.name.ilike(like),
            )
        )
        .filter_by(status="ACTIVE")
        .limit(10)
        .all()
    )

    return jsonify([
        {
            "id": u.id,
            "name": u.name,
            "username": u.username,
            "email": _mask_email(u.email),
            "avatarUrl": None,
        }
        for u in results
    ]), 200


@users_bp.route("/me", methods=["PATCH"])
@jwt_required()
def update_me():
    user = db.session.get(User, int(get_jwt_identity()))
    if not user:
        return error_response("Usuário não encontrado", 404)

    data = request.get_json(silent=True) or {}

    if "name" in data:
        name = (data.get("name") or "").strip()
        if not name:
            return error_response("Nome é obrigatório", 400)
        user.name = name

    if "email" in data:
        email = (data.get("email") or "").strip().lower()
        if not email:
            return error_response("E-mail é obrigatório", 400)
        user.email = email

    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return error_response("E-mail já cadastrado", 409)

    return jsonify(user.to_dict()), 200
