import os

from flask import Blueprint, jsonify, request, current_app, send_file

from app.extensions import db
from app.contacts.models import Contact
from app.utils.responses import error_response
from app.utils.validators import validate_required_fields

from .models import FILE_TYPES, ContactDocument

contact_documents_bp = Blueprint("contact_documents", __name__)

ALLOWED_FILE_TYPES = set(FILE_TYPES)


@contact_documents_bp.get("")
def list_documents():
    contact_id = request.args.get("contact_id")
    query = ContactDocument.query
    if contact_id:
        query = query.filter(ContactDocument.contact_id == contact_id)
    docs = query.order_by(ContactDocument.uploaded_at.desc()).all()
    return jsonify([d.to_dict() for d in docs]), 200


@contact_documents_bp.get("/<int:document_id>/download")
def download_document(document_id):
    doc = ContactDocument.query.get(document_id)
    if doc is None:
        return error_response("Document not found", 404)

    if not doc.storage_path:
        return error_response("This document has no associated file", 404)

    upload_folder = current_app.config["UPLOAD_FOLDER"]
    abs_path = os.path.realpath(os.path.join(upload_folder, doc.storage_path))
    # Prevent path traversal: resolved path must start inside upload_folder
    if not abs_path.startswith(os.path.realpath(upload_folder) + os.sep):
        return error_response("Invalid file path", 400)

    if not os.path.isfile(abs_path):
        return error_response("File not found on server", 404)

    download_name = doc.original_filename or doc.name
    return send_file(
        abs_path,
        as_attachment=True,
        download_name=download_name,
        mimetype=doc.mime_type or "application/octet-stream",
    )


@contact_documents_bp.delete("/<int:document_id>")
def delete_document(document_id):
    doc = ContactDocument.query.get(document_id)
    if doc is None:
        return error_response("Document not found", 404)

    # Delete physical file if it exists
    if doc.storage_path:
        upload_folder = current_app.config["UPLOAD_FOLDER"]
        abs_path = os.path.realpath(os.path.join(upload_folder, doc.storage_path))
        if abs_path.startswith(os.path.realpath(upload_folder) + os.sep) and os.path.isfile(abs_path):
            try:
                os.remove(abs_path)
            except OSError:
                pass  # log in production; don't block the DB delete

    db.session.delete(doc)
    db.session.commit()
    return jsonify({"message": "document deleted"}), 200
