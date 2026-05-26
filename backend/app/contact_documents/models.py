from datetime import datetime, timezone
from app.extensions import db

FILE_TYPES = ("pdf", "image", "doc", "sheet", "other")

ALLOWED_EXTENSIONS = {"pdf", "png", "jpg", "jpeg", "doc", "docx", "xls", "xlsx", "txt"}

ALLOWED_MIME_TYPES = {
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/jpg",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
}


def ext_to_file_type(ext: str) -> str:
    ext = ext.lower().lstrip(".")
    if ext == "pdf":
        return "pdf"
    if ext in ("png", "jpg", "jpeg"):
        return "image"
    if ext in ("doc", "docx"):
        return "doc"
    if ext in ("xls", "xlsx"):
        return "sheet"
    return "other"


class ContactDocument(db.Model):
    __tablename__ = "contact_documents"

    id = db.Column(db.Integer, primary_key=True)
    contact_id = db.Column(db.Integer, db.ForeignKey("contacts.id"), nullable=False)
    name = db.Column(db.String(200), nullable=False)
    original_filename = db.Column(db.String(255), nullable=True)
    storage_path = db.Column(db.String(500), nullable=True)
    mime_type = db.Column(db.String(100), nullable=True)
    file_type = db.Column(db.String(20), nullable=False, default="other")  # pdf | image | doc | sheet | other
    size = db.Column(db.Integer, nullable=True)
    uploaded_by = db.Column(db.Integer, db.ForeignKey("contacts.id"), nullable=True)

    uploaded_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    contact = db.relationship("Contact", foreign_keys=[contact_id], backref=db.backref("documents", lazy=True))
    uploader = db.relationship("Contact", foreign_keys=[uploaded_by])

    def to_dict(self):
        return {
            "id": self.id,
            "contact_id": self.contact_id,
            "name": self.name,
            "original_filename": self.original_filename,
            "storage_path": self.storage_path,
            "mime_type": self.mime_type,
            "file_type": self.file_type,
            "size": self.size,
            "uploaded_by": self.uploaded_by,
            "uploaded_at": self.uploaded_at.isoformat() if self.uploaded_at else None,
            "has_file": self.storage_path is not None,
        }
