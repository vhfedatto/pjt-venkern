from datetime import datetime, timezone

from app.extensions import db

TASK_STATUSES = ("todo", "in_progress", "review", "done", "late")
TASK_PRIORITIES = ("low", "medium", "high", "urgent")
ALLOWED_TASK_STATUSES = set(TASK_STATUSES)
ALLOWED_TASK_PRIORITIES = set(TASK_PRIORITIES)


class Task(db.Model):
    __tablename__ = "tasks"

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey("projects.id"), nullable=True, index=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(30), nullable=False)
    priority = db.Column(db.String(30), nullable=False)
    due_date = db.Column(db.DateTime(timezone=True), nullable=True)
    assignee_id = db.Column(db.Integer, db.ForeignKey("contacts.id"), nullable=True)
    team_id = db.Column(db.Integer, db.ForeignKey("teams.id"), nullable=True)
    tags = db.Column(db.JSON, nullable=True, default=list)

    # Kanban workflow fields (migration d1e2f3a4b5c6)
    accepted_at = db.Column(db.DateTime(timezone=True), nullable=True)
    completion_note = db.Column(db.Text, nullable=True)
    completion_file_url = db.Column(db.String(500), nullable=True)

    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc)
    )
    updated_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc)
    )

    assignee = db.relationship("Contact", back_populates="tasks")
    team = db.relationship("Team", back_populates="tasks")

    def to_dict(self):
        return {
            "id": self.id,
            "project_id": self.project_id,
            "title": self.title,
            "description": self.description,
            "status": self.status,
            "priority": self.priority,
            "due_date": self.due_date.isoformat() if self.due_date else None,
            "assignee": {
                "id": self.assignee.id,
                "full_name": self.assignee.full_name,
                "initials": self.assignee.get_initials(),
            } if self.assignee else None,
            "team": {
                "id": self.team.id,
                "name": self.team.name,
                "color": self.team.color,
            } if self.team else None,
            "tags": self.tags or [],
            "accepted_at": self.accepted_at.isoformat() if self.accepted_at else None,
            "completion_note": self.completion_note,
            "completion_file_url": self.completion_file_url,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
