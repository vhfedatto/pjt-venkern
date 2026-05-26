from datetime import datetime, timezone
import re
from app.extensions import db

PROJECT_STATUSES = ("ACTIVE", "ARCHIVED", "BLOCKED")
MEMBER_ROLES = ("ADMIN", "PROFESSIONAL")
MEMBER_STATUSES = ("PENDING", "ACTIVE", "REMOVED", "BLOCKED")


def _slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    return text


class Project(db.Model):
    __tablename__ = "projects"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    slug = db.Column(db.String(120), unique=True, nullable=False, index=True)
    description = db.Column(db.Text, nullable=True)
    owner_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    status = db.Column(db.String(20), nullable=False, default="ACTIVE")

    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc)
    )
    updated_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc)
    )

    owner = db.relationship("User", foreign_keys=[owner_id], backref="owned_projects")
    members = db.relationship("ProjectMember", back_populates="project", lazy=True,
                              foreign_keys="ProjectMember.project_id")

    @staticmethod
    def make_unique_slug(name: str) -> str:
        base = _slugify(name)
        slug = base
        counter = 1
        while Project.query.filter_by(slug=slug).first():
            slug = f"{base}-{counter}"
            counter += 1
        return slug

    def to_dict(self, include_members: bool = False):
        result = {
            "id": self.id,
            "name": self.name,
            "slug": self.slug,
            "description": self.description,
            "owner_id": self.owner_id,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
        if include_members:
            result["members"] = [m.to_dict() for m in self.members if m.status == "ACTIVE"]
        return result


class ProjectMember(db.Model):
    __tablename__ = "project_members"

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey("projects.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    role = db.Column(db.String(20), nullable=False, default="PROFESSIONAL")
    status = db.Column(db.String(20), nullable=False, default="ACTIVE")
    invited_by_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    joined_at = db.Column(db.DateTime(timezone=True), nullable=True,
                          default=lambda: datetime.now(timezone.utc))

    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc)
    )
    updated_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc)
    )

    __table_args__ = (
        db.UniqueConstraint("project_id", "user_id", name="uq_project_member"),
    )

    project = db.relationship("Project", back_populates="members",
                               foreign_keys=[project_id])
    user = db.relationship("User", foreign_keys=[user_id], backref="project_memberships")
    invited_by = db.relationship("User", foreign_keys=[invited_by_id])

    def to_dict(self):
        return {
            "id": self.id,
            "project_id": self.project_id,
            "user_id": self.user_id,
            "role": self.role,
            "status": self.status,
            "invited_by_id": self.invited_by_id,
            "joined_at": self.joined_at.isoformat() if self.joined_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
