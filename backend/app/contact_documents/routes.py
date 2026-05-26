import os

from flask import Blueprint, jsonify, request, current_app, send_file
from werkzeug.utils import secure_filename

from app.extensions import db
from app.contacts.models import Contact
from app.projects.permissions import check_project_access
from app.utils.responses import error_response
from app.utils.validators import validate_required_fields

from .models import ALLOWED_EXTENSIONS, ALLOWED_MIME_TYPES, FILE_TYPES, ContactDocument, ext_to_file_type

contact_documents_bp = Blueprint("contact_documents", __name__)

ALLOWED_FILE_TYPES = set(FILE_TYPES)


def _get_contact_or_error(contact_id):
    contact = Contact.query.get(contact_id)
    if contact is None:
        return None, error_response("Contato não encontrado", 404)
    access_err = check_project_access(contact.project_id)
    if access_err:
        return None, access_err
    return contact, None


def _get_document_or_error(document_id):
    doc = ContactDocument.query.get(document_id)
    if doc is None:
        return None, error_response("Document not found", 404)
    contact, err = _get_contact_or_error(doc.contact_id)
    if err:
        return None, err
    return doc, None


@contact_documents_bp.get("")
def list_documents():
    contact_id = request.args.get("contact_id")
    query = ContactDocument.query
    if contact_id:
        contact, err = _get_contact_or_error(int(contact_id))
        if err:
          return err
        query = query.filter(ContactDocument.contact_id == contact.id)
    docs = query.order_by(ContactDocument.uploaded_at.desc()).all()
    return jsonify([d.to_dict() for d in docs]), 200


@contact_documents_bp.post("")
def create_document():
    if request.content_type and request.content_type.startswith("multipart/form-data"):
        contact_id = request.form.get("contact_id")
        file = request.files.get("file")
        if not contact_id or file is None:
            return error_response("contact_id e file são obrigatórios", 400)

        contact, err = _get_contact_or_error(int(contact_id))
        if err:
            return err

        if not file.filename:
            return error_response("Arquivo inválido", 400)

        original_filename = secure_filename(file.filename)
        ext = original_filename.rsplit(".", 1)[-1].lower() if "." in original_filename else ""
        if ext not in ALLOWED_EXTENSIONS:
            return error_response("Extensão de arquivo não permitida", 400)
        if file.mimetype not in ALLOWED_MIME_TYPES:
            return error_response("Tipo de arquivo não permitido", 400)

        upload_folder = current_app.config["UPLOAD_FOLDER"]
        os.makedirs(upload_folder, exist_ok=True)
        stored_name = f"{contact.id}_{int(ContactDocument.query.count()) + 1}_{original_filename}"
        save_path = os.path.join(upload_folder, stored_name)
        file.save(save_path)

        doc = ContactDocument(
            contact_id=contact.id,
            name=(request.form.get("name") or original_filename).strip(),
            original_filename=original_filename,
            storage_path=stored_name,
            mime_type=file.mimetype,
            file_type=ext_to_file_type(ext),
            size=os.path.getsize(save_path),
            uploaded_by=int(request.form["uploaded_by"]) if request.form.get("uploaded_by") else None,
        )
        db.session.add(doc)
        db.session.commit()
        return jsonify(doc.to_dict()), 201

    data = request.get_json(silent=True) or {}
    required_error = validate_required_fields(data, ["contact_id", "name"])
    if required_error:
        return error_response(required_error, 400)

    contact, err = _get_contact_or_error(int(data["contact_id"]))
    if err:
        return err

    file_type = data.get("file_type", "other")
    if file_type not in ALLOWED_FILE_TYPES:
        return error_response(f"file_type must be one of: {', '.join(sorted(ALLOWED_FILE_TYPES))}", 400)

    doc = ContactDocument(
        contact_id=contact.id,
        name=data["name"].strip(),
        original_filename=data.get("original_filename"),
        storage_path=data.get("storage_path"),
        mime_type=data.get("mime_type"),
        file_type=file_type,
        size=data.get("size"),
        uploaded_by=data.get("uploaded_by"),
    )
    db.session.add(doc)
    db.session.commit()
    return jsonify(doc.to_dict()), 201


@contact_documents_bp.get("/<int:document_id>/download")
def download_document(document_id):
    doc, err = _get_document_or_error(document_id)
    if err:
        return err

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
    doc, err = _get_document_or_error(document_id)
    if err:
        return err

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
