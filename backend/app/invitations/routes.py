from datetime import datetime, timezone

from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

from app.extensions import db
from app.invitations.models import MemberInvitation, Notification, ProjectInvite
from app.projects.permissions import get_current_user, is_project_admin
from app.utils.responses import error_response

invitations_bp = Blueprint("invitations", __name__)


# ── Public: get invite info by token ─────────────────────────────────────────
@invitations_bp.route("/invites/<string:token>", methods=["GET"])
def get_invite_info(token):
    invite = ProjectInvite.query.filter_by(token=token).first()
    if not invite:
        return jsonify({"valid": False, "error": "Convite não encontrado"}), 404

    return jsonify({
        "projectName": invite.project.name if invite.project else None,
        "role": invite.role,
        "valid": invite.is_valid(),
        "expiresAt": invite.expires_at.isoformat() if invite.expires_at else None,
    }), 200


# ── Accept invite by link token ───────────────────────────────────────────────
@invitations_bp.route("/invites/<string:token>/accept", methods=["POST"])
@jwt_required()
def accept_link_invite(token):
    from app.projects.models import ProjectMember

    user = get_current_user()
    if not user:
        return error_response("Usuário não encontrado", 404)

    invite = ProjectInvite.query.filter_by(token=token).first()
    if not invite:
        return error_response("Convite não encontrado", 404)
    if not invite.is_valid():
        return error_response("Convite inválido ou expirado", 400)

    existing = ProjectMember.query.filter_by(
        project_id=invite.project_id, user_id=user.id, status="ACTIVE"
    ).first()
    if existing:
        return error_response("Você já é membro deste projeto", 409)

    member = ProjectMember(
        project_id=invite.project_id,
        user_id=user.id,
        role=invite.role,
        status="ACTIVE",
        invited_by_id=invite.created_by_id,
        joined_at=datetime.now(timezone.utc),
    )
    db.session.add(member)
    invite.used_count += 1
    db.session.commit()

    return jsonify({"data": invite.project.to_dict()}), 200


# ── List my pending invitations ────────────────────────────────────────────────
@invitations_bp.route("/invitations/me", methods=["GET"])
@jwt_required()
def my_invitations():
    user = get_current_user()
    if not user:
        return error_response("Usuário não encontrado", 404)

    invitations = (
        MemberInvitation.query
        .filter_by(invited_user_id=user.id, status="PENDING")
        .order_by(MemberInvitation.created_at.desc())
        .all()
    )
    return jsonify({"data": [i.to_dict() for i in invitations]}), 200


# ── Accept direct invitation ───────────────────────────────────────────────────
@invitations_bp.route("/invitations/<int:invitation_id>/accept", methods=["POST"])
@jwt_required()
def accept_invitation(invitation_id):
    from app.projects.models import ProjectMember

    user = get_current_user()
    if not user:
        return error_response("Usuário não encontrado", 404)

    invitation = db.session.get(MemberInvitation, invitation_id)
    if not invitation:
        return error_response("Convite não encontrado", 404)
    if invitation.invited_user_id != user.id:
        return error_response("Acesso negado", 403)
    if invitation.status != "PENDING":
        return error_response("Este convite não está pendente", 400)

    # Idempotent: if somehow already a member, just mark accepted
    existing = ProjectMember.query.filter_by(
        project_id=invitation.project_id, user_id=user.id, status="ACTIVE"
    ).first()
    if not existing:
        member = ProjectMember(
            project_id=invitation.project_id,
            user_id=user.id,
            role=invitation.role,
            status="ACTIVE",
            invited_by_id=invitation.invited_by_id,
            joined_at=datetime.now(timezone.utc),
        )
        db.session.add(member)

    invitation.status = "ACCEPTED"
    invitation.responded_at = datetime.now(timezone.utc)

    # Notify the person who sent the invite
    notif = Notification(
        user_id=invitation.invited_by_id,
        project_id=invitation.project_id,
        type="INVITE",
        title="Convite aceito",
        content=f"{user.name} aceitou o convite para '{invitation.project.name}'.",
        is_read=False,
    )
    db.session.add(notif)
    db.session.commit()

    return jsonify(invitation.to_dict()), 200


# ── Refuse direct invitation ───────────────────────────────────────────────────
@invitations_bp.route("/invitations/<int:invitation_id>/refuse", methods=["POST"])
@jwt_required()
def refuse_invitation(invitation_id):
    user = get_current_user()
    if not user:
        return error_response("Usuário não encontrado", 404)

    invitation = db.session.get(MemberInvitation, invitation_id)
    if not invitation:
        return error_response("Convite não encontrado", 404)
    if invitation.invited_user_id != user.id:
        return error_response("Acesso negado", 403)
    if invitation.status != "PENDING":
        return error_response("Este convite não está pendente", 400)

    invitation.status = "REFUSED"
    invitation.responded_at = datetime.now(timezone.utc)
    db.session.commit()

    return jsonify(invitation.to_dict()), 200


# ── Cancel invitation (by inviter or project admin) ───────────────────────────
@invitations_bp.route("/invitations/<int:invitation_id>/cancel", methods=["POST"])
@jwt_required()
def cancel_invitation(invitation_id):
    user = get_current_user()
    if not user:
        return error_response("Usuário não encontrado", 404)

    invitation = db.session.get(MemberInvitation, invitation_id)
    if not invitation:
        return error_response("Convite não encontrado", 404)
    if invitation.status != "PENDING":
        return error_response("Este convite não está pendente", 400)

    if invitation.invited_by_id != user.id and not is_project_admin(user, invitation.project_id):
        return error_response("Acesso negado", 403)

    invitation.status = "CANCELLED"
    invitation.responded_at = datetime.now(timezone.utc)
    db.session.commit()

    return jsonify(invitation.to_dict()), 200


# ── Notifications ──────────────────────────────────────────────────────────────
@invitations_bp.route("/notifications", methods=["GET"])
@jwt_required()
def list_notifications():
    user = get_current_user()
    if not user:
        return error_response("Usuário não encontrado", 404)

    notifs = (
        Notification.query
        .filter_by(user_id=user.id)
        .order_by(Notification.created_at.desc())
        .limit(50)
        .all()
    )
    unread_count = Notification.query.filter_by(user_id=user.id, is_read=False).count()

    return jsonify({
        "data": [n.to_dict() for n in notifs],
        "unread_count": unread_count,
    }), 200


@invitations_bp.route("/notifications/<int:notif_id>/read", methods=["PATCH"])
@jwt_required()
def mark_notification_read(notif_id):
    user = get_current_user()
    if not user:
        return error_response("Usuário não encontrado", 404)

    notif = db.session.get(Notification, notif_id)
    if not notif or notif.user_id != user.id:
        return error_response("Notificação não encontrada", 404)

    notif.is_read = True
    db.session.commit()
    return jsonify(notif.to_dict()), 200


@invitations_bp.route("/notifications/read-all", methods=["PATCH"])
@jwt_required()
def mark_all_notifications_read():
    user = get_current_user()
    if not user:
        return error_response("Usuário não encontrado", 404)

    Notification.query.filter_by(user_id=user.id, is_read=False).update({"is_read": True})
    db.session.commit()
    return jsonify({"ok": True}), 200
