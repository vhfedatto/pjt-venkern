from flask import Blueprint, request, jsonify
from sqlalchemy.exc import IntegrityError

from app.extensions import db
from app.utils.responses import error_response
from app.utils.validators import parse_int, validate_email, validate_required_fields
from app.teams.models import Team
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
        try:
            query = query.filter(Contact.team_id == parse_int(team_id, "team_id"))
        except ValueError as exc:
            return error_response(str(exc), 400)

    contacts = query.order_by(Contact.full_name.asc()).all()

    return jsonify([contact.to_dict() for contact in contacts]), 200


@contacts_bp.post("")
def create_contact():
    data = request.get_json(silent=True) or {}

    required_error = validate_required_fields(data, ["full_name", "phone", "email"])
    if required_error:
        return error_response(required_error, 400)

    email_error = validate_email(data.get("email"))
    if email_error:
        return error_response(email_error, 400)

    team_id = data.get("team_id")
    if team_id not in (None, ""):
        try:
            team_id = parse_int(team_id, "team_id")
        except ValueError as exc:
            return error_response(str(exc), 400)

        if Team.query.get(team_id) is None:
            return error_response("team_id does not reference an existing team", 400)

    contact = Contact(
        full_name=data.get("full_name").strip(),
        phone=data.get("phone").strip(),
        email=data.get("email").strip(),
        role=data.get("role"),
        function_type=data.get("function_type"),
        notes=data.get("notes"),
        team_id=team_id,
        is_favorite=data.get("is_favorite", False)
    )

    try:
        db.session.add(contact)
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return error_response("Email already exists", 400)

    return jsonify(contact.to_dict()), 201


@contacts_bp.get("/<int:contact_id>")
def get_contact(contact_id):
    contact = Contact.query.get_or_404(contact_id)
    return jsonify(contact.to_dict()), 200


@contacts_bp.put("/<int:contact_id>")
def update_contact(contact_id):
    contact = Contact.query.get_or_404(contact_id)
    data = request.get_json(silent=True) or {}

    if "full_name" in data:
        required_error = validate_required_fields(data, ["full_name"])
        if required_error:
            return error_response(required_error, 400)
        contact.full_name = data.get("full_name").strip()

    if "phone" in data:
        required_error = validate_required_fields(data, ["phone"])
        if required_error:
            return error_response(required_error, 400)
        contact.phone = data.get("phone").strip()

    if "email" in data:
        required_error = validate_required_fields(data, ["email"])
        if required_error:
            return error_response(required_error, 400)
        email_error = validate_email(data.get("email"))
        if email_error:
            return error_response(email_error, 400)
        contact.email = data.get("email").strip()

    contact.role = data.get("role", contact.role)
    contact.function_type = data.get("function_type", contact.function_type)
    contact.notes = data.get("notes", contact.notes)

    if "team_id" in data:
        team_id = data.get("team_id")
        if team_id in (None, ""):
            contact.team_id = None
        else:
            try:
                team_id = parse_int(team_id, "team_id")
            except ValueError as exc:
                return error_response(str(exc), 400)

            if Team.query.get(team_id) is None:
                return error_response("team_id does not reference an existing team", 400)

            contact.team_id = team_id

    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return error_response("Email already exists", 400)

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
