from datetime import datetime, timezone
from app.extensions import db

INTERACTION_TYPES = ("call", "whatsapp", "email", "meeting", "note")


class ContactInteraction(db.Model):
    __tablename__ = "contact_interactions"

    id = db.Column(db.Integer, primary_key=True)
    contact_id = db.Column(db.Integer, db.ForeignKey("contacts.id"), nullable=False)
    type = db.Column(db.String(30), nullable=False)       # call | whatsapp | email | meeting | note
    description = db.Column(db.Text, nullable=False)
    created_by = db.Column(db.Integer, db.ForeignKey("contacts.id"), nullable=True)

    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    contact = db.relationship("Contact", foreign_keys=[contact_id], backref=db.backref("interactions", lazy=True))
    creator = db.relationship("Contact", foreign_keys=[created_by])

    def to_dict(self):
        return {
            "id": self.id,
            "contact_id": self.contact_id,
            "type": self.type,
            "description": self.description,
            "created_by": self.created_by,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
