from datetime import datetime, timezone
from app.extensions import db

EVENT_STATUSES = ("draft", "scheduled", "sent", "completed")


class AppEvent(db.Model):
    __tablename__ = "events"

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey("projects.id"), nullable=True, index=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    date = db.Column(db.Date, nullable=False)
    time = db.Column(db.String(10), nullable=True)          # e.g. "14:00"
    location = db.Column(db.String(200), nullable=True)
    banner_url = db.Column(db.String(500), nullable=True)
    target_audience = db.Column(db.JSON, nullable=True, default=list)  # ["all"] or ["t1","t2"]
    status = db.Column(db.String(30), nullable=False, default="draft")

    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )
    sent_at = db.Column(db.DateTime(timezone=True), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "project_id": self.project_id,
            "title": self.title,
            "description": self.description,
            "date": self.date.isoformat() if self.date else None,
            "time": self.time,
            "location": self.location,
            "banner_url": self.banner_url,
            "target_audience": self.target_audience or [],
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "sent_at": self.sent_at.isoformat() if self.sent_at else None,
        }
