import os
import re

from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required

from app.extensions import db
from app.utils.responses import error_response, success_response

from .models import PasswordResetToken, User

auth_bp = Blueprint("auth", __name__)

_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def _valid_email(email: str) -> bool:
    return bool(_EMAIL_RE.match(email))


# ── Register ──────────────────────────────────────────────────────────────────
@auth_bp.post("/register")
def register():
    data = request.get_json(silent=True) or {}

    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    username_raw = (data.get("username") or "").strip().lstrip("@").lower()

    if not name:
        return error_response("Nome é obrigatório")
    if not email or not _valid_email(email):
        return error_response("E-mail inválido")
    if len(password) < 6:
        return error_response("A senha deve ter no mínimo 6 caracteres")
    if username_raw and (len(username_raw) < 3 or len(username_raw) > 50):
        return error_response("Username deve ter entre 3 e 50 caracteres")

    if User.query.filter_by(email=email).first():
        return error_response("E-mail já cadastrado", 409)

    if username_raw and User.query.filter_by(username=username_raw).first():
        return error_response("Username já utilizado", 409)

    user = User(name=name, email=email, role="admin",
                username=username_raw or None)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    token = create_access_token(identity=str(user.id))
    return jsonify({
        "access_token": token,
        "user": user.to_dict(),
        "projects": [],
    }), 201


# ── Login ─────────────────────────────────────────────────────────────────────
@auth_bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}

    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return error_response("E-mail e senha são obrigatórios")

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return error_response("Credenciais inválidas", 401)

    if not user.is_active or user.status == "BLOCKED":
        return error_response("Conta desativada. Contate o administrador.", 403)

    from app.projects.permissions import get_user_projects
    token = create_access_token(identity=str(user.id))
    return jsonify({
        "access_token": token,
        "user": user.to_dict(),
        "projects": get_user_projects(user),
    }), 200


# ── Current user ──────────────────────────────────────────────────────────────
@auth_bp.get("/me")
@jwt_required()
def me():
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)
    if not user:
        return error_response("Usuário não encontrado", 404)
    from app.projects.permissions import get_user_projects
    return jsonify({**user.to_dict(), "projects": get_user_projects(user)}), 200


# ── Search users (admin) ──────────────────────────────────────────────────────
@auth_bp.get("/users/search")
@jwt_required()
def search_users():
    caller_id = int(get_jwt_identity())
    caller = db.session.get(User, caller_id)
    if not caller or (caller.role != "admin" and not caller.is_super_admin):
        return error_response("Acesso negado", 403)

    q = (request.args.get("q") or "").strip().lstrip("@")
    if len(q) < 2:
        return jsonify([]), 200

    users = (
        User.query
        .filter(
            db.or_(
                User.username.ilike(f"%{q}%"),
                User.name.ilike(f"%{q}%"),
            )
        )
        .filter_by(is_active=True)
        .limit(10)
        .all()
    )
    return jsonify([u.to_dict() for u in users]), 200


# ── Forgot password ───────────────────────────────────────────────────────────
@auth_bp.post("/forgot-password")
def forgot_password():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()

    if not email or not _valid_email(email):
        return error_response("E-mail inválido")

    user = User.query.filter_by(email=email).first()

    response = {"message": "Se o e-mail estiver cadastrado, você receberá as instruções em breve."}

    if user:
        # Invalidate previous tokens
        PasswordResetToken.query.filter_by(user_id=user.id, used=False).update({"used": True})
        reset = PasswordResetToken.generate(user.id)
        db.session.add(reset)
        db.session.commit()

        # Expose token in development so it can be tested without an email server
        if os.getenv("FLASK_ENV", "production") == "development":
            response["reset_token"] = reset.token

    return jsonify(response), 200


# ── Reset password ────────────────────────────────────────────────────────────
@auth_bp.post("/reset-password")
def reset_password():
    data = request.get_json(silent=True) or {}
    token_str = data.get("token") or ""
    new_password = data.get("new_password") or ""

    if not token_str:
        return error_response("Token é obrigatório")
    if len(new_password) < 6:
        return error_response("A senha deve ter no mínimo 6 caracteres")

    reset = PasswordResetToken.query.filter_by(token=token_str).first()
    if not reset or not reset.is_valid:
        return error_response("Token inválido ou expirado", 400)

    reset.user.set_password(new_password)
    reset.used = True
    db.session.commit()

    return success_response(message="Senha redefinida com sucesso")
