from datetime import datetime, timezone
from app.extensions import db

# Association table for group members
group_members = db.Table(
    "group_members",
    db.Column("group_id", db.Integer, db.ForeignKey("groups.id"), primary_key=True),
    db.Column("contact_id", db.Integer, db.ForeignKey("contacts.id"), primary_key=True),
)

MESSAGE_TYPES = ("text", "image", "blocked", "event_banner")


class Group(db.Model):
    __tablename__ = "groups"

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey("projects.id"), nullable=True, index=True)
    name = db.Column(db.String(120), nullable=False)
    type = db.Column(db.String(20), nullable=False, default="general")  # general | team
    team_id = db.Column(db.Integer, db.ForeignKey("teams.id"), nullable=True)

    last_activity = db.Column(db.DateTime(timezone=True), nullable=True)

    members = db.relationship("Contact", secondary=group_members, lazy="subquery")
    messages = db.relationship(
        "GroupMessage", back_populates="group", lazy=True,
        order_by="GroupMessage.timestamp",
    )
    team = db.relationship("Team", backref=db.backref("groups", lazy=True))

    def to_dict(self, include_messages=True):
        result = {
            "id": self.id,
            "project_id": self.project_id,
            "name": self.name,
            "type": self.type,
            "team_id": self.team_id,
            "member_ids": [m.id for m in self.members],
            "last_activity": self.last_activity.isoformat() if self.last_activity else None,
        }
        if include_messages:
            result["messages"] = [m.to_dict() for m in self.messages]
        return result


class GroupMessage(db.Model):
    __tablename__ = "group_messages"

    id = db.Column(db.Integer, primary_key=True)
    group_id = db.Column(db.Integer, db.ForeignKey("groups.id"), nullable=False)
    sender_id = db.Column(db.Integer, db.ForeignKey("contacts.id"), nullable=False)
    content = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(20), nullable=False, default="text")
    blocked = db.Column(db.Boolean, default=False, nullable=False)
    image_url = db.Column(db.String(500), nullable=True)

    timestamp = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    group = db.relationship("Group", back_populates="messages")
    sender = db.relationship("Contact", foreign_keys=[sender_id])

    def to_dict(self):
        return {
            "id": self.id,
            "group_id": self.group_id,
            "sender_id": self.sender_id,
            "content": self.content,
            "type": self.type,
            "blocked": self.blocked,
            "image_url": self.image_url,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
        }
