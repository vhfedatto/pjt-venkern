from datetime import datetime, timezone
from app.extensions import db


class Contact(db.Model):
    __tablename__ = "contacts"

    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(30), nullable=False)
    email = db.Column(db.String(120), nullable=False, unique=True)
    role = db.Column(db.String(120), nullable=True)
    function_type = db.Column(db.String(50), nullable=True)
    notes = db.Column(db.Text, nullable=True)

    team_id = db.Column(db.Integer, nullable=True)

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

    def to_dict(self):
        initials = "".join(
            [part[0] for part in self.full_name.split()[:2]]
        ).upper()

        return {
            "id": self.id,
            "full_name": self.full_name,
            "initials": initials,
            "phone": self.phone,
            "email": self.email,
            "role": self.role,
            "function_type": self.function_type,
            "notes": self.notes,
            "team_id": self.team_id,
            "is_favorite": self.is_favorite,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }