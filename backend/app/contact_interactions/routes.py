from flask import Blueprint, jsonify, request

from app.extensions import db
from app.contacts.models import Contact
from app.projects.permissions import check_project_access
from app.utils.responses import error_response
from app.utils.validators import validate_required_fields

from .models import INTERACTION_TYPES, ContactInteraction

contact_interactions_bp = Blueprint("contact_interactions", __name__)

ALLOWED_TYPES = set(INTERACTION_TYPES)


def _get_contact_or_error(contact_id):
    contact = db.session.get(Contact, contact_id)
    if contact is None:
        return None, error_response("contact_id does not reference an existing contact", 404)
    access_err = check_project_access(contact.project_id)
    if access_err:
        return None, access_err
    return contact, None


def _get_interaction_or_error(interaction_id):
    interaction = db.session.get(ContactInteraction, interaction_id)
    if interaction is None:
        return None, error_response("Interaction not found", 404)
    _, err = _get_contact_or_error(interaction.contact_id)
    if err:
        return None, err
    return interaction, None


@contact_interactions_bp.get("")
def list_interactions():
    """GET /api/contacts/<id>/interactions  (contact_id from query param)"""
    contact_id = request.args.get("contact_id")
    query = ContactInteraction.query
    if contact_id:
        contact, err = _get_contact_or_error(int(contact_id))
        if err:
            return err
        query = query.filter(ContactInteraction.contact_id == contact.id)
    interactions = query.order_by(ContactInteraction.created_at.desc()).all()
    return jsonify([i.to_dict() for i in interactions]), 200


@contact_interactions_bp.post("")
def create_interaction():
    data = request.get_json(silent=True) or {}
    required_error = validate_required_fields(data, ["contact_id", "type", "description"])
    if required_error:
        return error_response(required_error, 400)

    contact_id = int(data["contact_id"])
    _, err = _get_contact_or_error(contact_id)
    if err:
        return err

    interaction_type = data["type"]
    if interaction_type not in ALLOWED_TYPES:
        return error_response(f"type must be one of: {', '.join(sorted(ALLOWED_TYPES))}", 400)

    interaction = ContactInteraction(
            contact_id=contact_id,
            type=interaction_type,
            description=data["description"],
            created_by=data.get("created_by"),
    )
    db.session.add(interaction)
    db.session.commit()
    return jsonify(interaction.to_dict()), 201


@contact_interactions_bp.post("/broadcast")
def broadcast_interaction():
    """POST /api/contact-interactions/broadcast
    Body: { type, description }
    Creates one interaction per contact for all existing contacts.
    """
    data = request.get_json(silent=True) or {}
    required_error = validate_required_fields(data, ["type", "description"])
    if required_error:
        return error_response(required_error, 400)

    interaction_type = data["type"]
    if interaction_type not in ALLOWED_TYPES:
        return error_response(f"type must be one of: {', '.join(sorted(ALLOWED_TYPES))}", 400)

    description = data["description"].strip()
    if not description:
        return error_response("description cannot be empty", 400)

    project_id = data.get("project_id")
    if not project_id:
        return error_response("project_id é obrigatório", 400)
    access_err = check_project_access(project_id)
    if access_err:
        return access_err

    all_contacts = Contact.query.filter_by(project_id=int(project_id)).all()
    if not all_contacts:
        return error_response("Nenhum contato encontrado", 404)

    interactions = [
        ContactInteraction(
            contact_id=c.id,
            type=interaction_type,
            description=description,
        )
        for c in all_contacts
    ]
    db.session.add_all(interactions)
    db.session.commit()

    return jsonify({"created": len(interactions)}), 201


@contact_interactions_bp.delete("/<int:interaction_id>")
def delete_interaction(interaction_id):
    interaction, err = _get_interaction_or_error(interaction_id)
    if err:
        return err
    db.session.delete(interaction)
    db.session.commit()
    return jsonify({"message": "interaction deleted"}), 200
