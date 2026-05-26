from datetime import datetime, timezone
from app.extensions import db

MODERATION_STATUSES = ("pending", "resolved", "dismissed")
MODERATION_CONTEXTS = ("group", "chat")


class ModerationAlert(db.Model):
    __tablename__ = "moderation_alerts"

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey("projects.id"), nullable=True, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey("contacts.id"), nullable=False)
    context = db.Column(db.String(20), nullable=False)       # group | chat
    context_id = db.Column(db.String(50), nullable=False)    # id of the group or chat
    context_name = db.Column(db.String(120), nullable=True)
    content = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), nullable=False, default="pending")

    timestamp = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    user = db.relationship("Contact", foreign_keys=[user_id])

    def to_dict(self):
        return {
            "id": self.id,
            "project_id": self.project_id,
            "user_id": self.user_id,
            "context": self.context,
            "context_id": self.context_id,
            "context_name": self.context_name,
            "content": self.content,
            "status": self.status,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
        }
