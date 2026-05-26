"""Helpers for authenticating WebSocket connections via JWT."""
from flask_jwt_extended import decode_token
from flask_jwt_extended.exceptions import JWTExtendedException
from jwt.exceptions import PyJWTError

from app.auth.models import User
from app.extensions import db


def get_user_from_socket_token(token: str | None) -> User | None:
    """Decode a raw JWT string and return the corresponding User, or None."""
    if not token:
        return None
    try:
        decoded = decode_token(token)
        user_id = decoded.get("sub")
        if user_id is None:
            return None
        return db.session.get(User, int(user_id))
    except (JWTExtendedException, PyJWTError, ValueError, TypeError):
        return None
