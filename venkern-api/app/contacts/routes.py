from flask import Blueprint, request, jsonify
from app.extensions import db
from .models import Contact

contacts_bp = Blueprint("contacts", __name__)

@contacts_bp.get("")
def list_contacts():
    search = request.args.get("search")
    favorite = request.args.get("favorite")
    team_id = request.args.get("team_id")

    query = Contact.query

    if search:
        term = f"%{search}%"
        query = query.filter(
            (Contact.full_name.ilike(term)) |
            (Contact.email.ilike(term)) |
            (Contact.phone.ilike(term))
        )

    if favorite is not None:
        query = query.filter(Contact.is_favorite == (favorite.lower() == "true"))

    if team_id:
        query = query.filter(Contact.team_id == int(team_id))

    contacts = query.order_by(Contact.full_name.asc()).all()

    return jsonify([contact.to_dict() for contact in contacts]), 200


@contacts_bp.post("")
def create_contact():
    data = request.get_json()

    if not data.get("full_name"):
        return jsonify({"error": "full_name is required"}), 400

    if not data.get("phone"):
        return jsonify({"error": "phone is required"}), 400

    if not data.get("email"):
        return jsonify({"error": "email is required"}), 400

    contact = Contact(
        full_name=data.get("full_name"),
        phone=data.get("phone"),
        email=data.get("email"),
        role=data.get("role"),
        function_type=data.get("function_type"),
        notes=data.get("notes"),
        team_id=data.get("team_id"),
        is_favorite=data.get("is_favorite", False)
    )

    db.session.add(contact)
    db.session.commit()

    return jsonify(contact.to_dict()), 201


@contacts_bp.get("/<int:contact_id>")
def get_contact(contact_id):
    contact = Contact.query.get_or_404(contact_id)
    return jsonify(contact.to_dict()), 200


@contacts_bp.put("/<int:contact_id>")
def update_contact(contact_id):
    contact = Contact.query.get_or_404(contact_id)
    data = request.get_json()

    contact.full_name = data.get("full_name", contact.full_name)
    contact.phone = data.get("phone", contact.phone)
    contact.email = data.get("email", contact.email)
    contact.role = data.get("role", contact.role)
    contact.function_type = data.get("function_type", contact.function_type)
    contact.notes = data.get("notes", contact.notes)
    contact.team_id = data.get("team_id", contact.team_id)

    db.session.commit()

    return jsonify(contact.to_dict()), 200


@contacts_bp.delete("/<int:contact_id>")
def delete_contact(contact_id):
    contact = Contact.query.get_or_404(contact_id)

    db.session.delete(contact)
    db.session.commit()

    return "", 204


@contacts_bp.patch("/<int:contact_id>/favorite")
def toggle_favorite(contact_id):
    contact = Contact.query.get_or_404(contact_id)
    data = request.get_json(silent=True) or {}

    if "is_favorite" in data:
        contact.is_favorite = data["is_favorite"]
    else:
        contact.is_favorite = not contact.is_favorite

    db.session.commit()

    return jsonify(contact.to_dict()), 200