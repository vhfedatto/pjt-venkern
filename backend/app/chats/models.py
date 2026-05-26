from datetime import datetime, timezone
from app.extensions import db


class ChatConversation(db.Model):
    __tablename__ = "chat_conversations"

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey("projects.id"), nullable=True, index=True)
    participant_a = db.Column(db.Integer, db.ForeignKey("contacts.id"), nullable=False)
    participant_b = db.Column(db.Integer, db.ForeignKey("contacts.id"), nullable=False)
    last_activity = db.Column(db.DateTime(timezone=True), nullable=True)

    messages = db.relationship(
        "ChatMessage", back_populates="conversation", lazy=True,
        order_by="ChatMessage.timestamp",
    )

    contact_a = db.relationship("Contact", foreign_keys=[participant_a])
    contact_b = db.relationship("Contact", foreign_keys=[participant_b])

    def to_dict(self, include_messages=True):
        result = {
            "id": self.id,
            "participant_ids": [self.participant_a, self.participant_b],
            "last_activity": self.last_activity.isoformat() if self.last_activity else None,
        }
        if include_messages:
            result["messages"] = [m.to_dict() for m in self.messages]
        return result


class ChatMessage(db.Model):
    __tablename__ = "chat_messages"

    id = db.Column(db.Integer, primary_key=True)
    conversation_id = db.Column(db.Integer, db.ForeignKey("chat_conversations.id"), nullable=False)
    sender_id = db.Column(db.Integer, db.ForeignKey("contacts.id"), nullable=False)
    content = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(20), nullable=False, default="text")
    blocked = db.Column(db.Boolean, default=False, nullable=False)
    image_url = db.Column(db.String(500), nullable=True)

    timestamp = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    conversation = db.relationship("ChatConversation", back_populates="messages")
    sender = db.relationship("Contact", foreign_keys=[sender_id])

    def to_dict(self):
        return {
            "id": self.id,
            "conversation_id": self.conversation_id,
            "sender_id": self.sender_id,
            "content": self.content,
            "type": self.type,
            "blocked": self.blocked,
            "image_url": self.image_url,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
        }
