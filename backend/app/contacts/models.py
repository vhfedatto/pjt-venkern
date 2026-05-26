from datetime import datetime, timezone
from app.extensions import db


class Contact(db.Model):
    __tablename__ = "contacts"

    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(30), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    role = db.Column(db.String(120), nullable=True)
    function_type = db.Column(db.String(50), nullable=True)
    notes = db.Column(db.Text, nullable=True)

    project_id = db.Column(db.Integer, db.ForeignKey("projects.id"), nullable=True, index=True)
    team_id = db.Column(db.Integer, db.ForeignKey("teams.id"), nullable=True)
    team = db.relationship("Team", back_populates="contacts")
    tasks = db.relationship("Task", back_populates="assignee", lazy=True)

    origin = db.Column(db.String(50), nullable=True)  # whatsapp | instagram | email | indicacao | evento | manual
    next_action = db.Column(db.String(200), nullable=True)
    next_action_date = db.Column(db.Date, nullable=True)
    responsible_id = db.Column(db.Integer, db.ForeignKey("contacts.id"), nullable=True)
    responsible = db.relationship("Contact", remote_side="Contact.id", foreign_keys="Contact.responsible_id")

    is_favorite = db.Column(db.Boolean, default=False, nullable=False)

    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc)
    )

    updated_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc)
    )

    def get_initials(self):
        return "".join([part[0] for part in self.full_name.split()[:2]]).upper()

    def to_dict(self):
        from app.auth.models import User

        linked_user = User.query.filter_by(email=self.email).first()

        return {
            "id": self.id,
            "project_id": self.project_id,
            "full_name": self.full_name,
            "initials": self.get_initials(),
            "phone": self.phone,
            "email": self.email,
            "role": self.role,
            "function_type": self.function_type,
            "notes": self.notes,
            "team_id": self.team_id,
            "team": {
                "id": self.team.id,
                "name": self.team.name,
                "color": self.team.color,
            } if self.team else None,
            "is_favorite": self.is_favorite,
            "origin": self.origin,
            "next_action": self.next_action,
            "next_action_date": self.next_action_date.isoformat() if self.next_action_date else None,
            "responsible_id": self.responsible_id,
            "platform_account": {
                "exists": linked_user is not None,
                "user_id": linked_user.id if linked_user else None,
                "email": linked_user.email if linked_user else None,
            },
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
