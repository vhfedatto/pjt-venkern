import os
import secrets
from datetime import datetime, timezone

from app.extensions import db


class ProjectInvite(db.Model):
    """Link-based invite that grants access to a project."""
    __tablename__ = "project_invites"

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(
        db.Integer, db.ForeignKey("projects.id"), nullable=False, index=True
    )
    token = db.Column(db.String(64), unique=True, nullable=False, index=True)
    role = db.Column(db.String(20), nullable=False, default="PROFESSIONAL")
    created_by_id = db.Column(
        db.Integer, db.ForeignKey("users.id"), nullable=False
    )
    expires_at = db.Column(db.DateTime(timezone=True), nullable=True)
    max_uses = db.Column(db.Integer, nullable=True)   # None = unlimited
    used_count = db.Column(db.Integer, nullable=False, default=0)
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    project = db.relationship("Project", backref="invites")
    created_by = db.relationship("User", foreign_keys=[created_by_id])

    @staticmethod
    def generate_token() -> str:
        return secrets.token_urlsafe(32)

    def is_valid(self) -> bool:
        if not self.is_active:
            return False
        if self.expires_at and datetime.now(timezone.utc) > self.expires_at:
            return False
        if self.max_uses is not None and self.used_count >= self.max_uses:
            return False
        return True

    def to_dict(self, include_url: bool = False) -> dict:
        d = {
            "id": self.id,
            "project_id": self.project_id,
            "token": self.token,
            "role": self.role,
            "created_by_id": self.created_by_id,
            "expires_at": self.expires_at.isoformat() if self.expires_at else None,
            "max_uses": self.max_uses,
            "used_count": self.used_count,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
        if include_url:
            base = os.getenv("FRONTEND_URL", "http://localhost:5173")
            d["invite_url"] = f"{base}/invite/{self.token}"
        return d


class MemberInvitation(db.Model):
    """Direct @username invitation to join a project."""
    __tablename__ = "member_invitations"

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(
        db.Integer, db.ForeignKey("projects.id"), nullable=False, index=True
    )
    invited_user_id = db.Column(
        db.Integer, db.ForeignKey("users.id"), nullable=False, index=True
    )
    invited_by_id = db.Column(
        db.Integer, db.ForeignKey("users.id"), nullable=False
    )
    role = db.Column(db.String(20), nullable=False, default="PROFESSIONAL")
    status = db.Column(db.String(20), nullable=False, default="PENDING")
    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )
    responded_at = db.Column(db.DateTime(timezone=True), nullable=True)

    project = db.relationship("Project", backref="member_invitations")
    invited_user = db.relationship(
        "User", foreign_keys=[invited_user_id], backref="received_invitations"
    )
    invited_by = db.relationship(
        "User", foreign_keys=[invited_by_id], backref="sent_invitations"
    )

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "project_id": self.project_id,
            "project_name": self.project.name if self.project else None,
            "invited_user_id": self.invited_user_id,
            "invited_by_id": self.invited_by_id,
            "invited_by_name": self.invited_by.name if self.invited_by else None,
            "role": self.role,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "responded_at": (
                self.responded_at.isoformat() if self.responded_at else None
            ),
        }


class Notification(db.Model):
    """In-app notification for a user."""
    __tablename__ = "notifications"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(
        db.Integer, db.ForeignKey("users.id"), nullable=False, index=True
    )
    project_id = db.Column(
        db.Integer, db.ForeignKey("projects.id"), nullable=True
    )
    type = db.Column(db.String(20), nullable=False, default="SYSTEM")
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=True)
    is_read = db.Column(db.Boolean, nullable=False, default=False)
    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    user = db.relationship("User", foreign_keys=[user_id], backref="notifications")

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "project_id": self.project_id,
            "type": self.type,
            "title": self.title,
            "content": self.content,
            "is_read": self.is_read,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
