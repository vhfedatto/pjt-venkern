from flask import Flask, jsonify, request
from werkzeug.exceptions import BadRequest, NotFound
from flask_jwt_extended import verify_jwt_in_request
from flask_jwt_extended.exceptions import JWTExtendedException
from .config import config_by_env
from .extensions import db, migrate, cors, jwt, socketio
from .utils.responses import error_response
import os

def create_app():
    app = Flask(__name__)
    env = os.getenv("FLASK_ENV", "development")
    app.config.from_object(config_by_env.get(env, config_by_env["default"]))

    db.init_app(app)
    migrate.init_app(app, db)
    cors.init_app(app, origins=app.config["CORS_ORIGINS"], supports_credentials=True)
    jwt.init_app(app)
    socketio.init_app(app, cors_allowed_origins=app.config["CORS_ORIGINS"])

    from .auth.routes import auth_bp
    from .contacts.routes import contacts_bp
    from .dashboard.routes import dashboard_bp
    from .tasks.routes import tasks_bp
    from .teams.routes import teams_bp
    from .events.routes import events_bp
    from .contact_interactions.routes import contact_interactions_bp
    from .contact_documents.routes import contact_documents_bp
    from .groups.routes import groups_bp
    from .chats.routes import chats_bp
    from .moderation.routes import moderation_bp
    from .reports.routes import reports_bp
    from .invitations.routes import invitations_bp
    from .projects.routes import projects_bp
    from .users.routes import users_bp
    from .socket import events as socket_events  # noqa: F401

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(contacts_bp, url_prefix="/api/contacts")
    app.register_blueprint(dashboard_bp, url_prefix="/api/dashboard")
    app.register_blueprint(tasks_bp, url_prefix="/api/tasks")
    app.register_blueprint(teams_bp, url_prefix="/api/teams")
    app.register_blueprint(events_bp, url_prefix="/api/events")
    app.register_blueprint(contact_interactions_bp, url_prefix="/api/contact-interactions")
    app.register_blueprint(contact_documents_bp, url_prefix="/api/contact-documents")
    app.register_blueprint(groups_bp, url_prefix="/api/groups")
    app.register_blueprint(chats_bp, url_prefix="/api/chats")
    app.register_blueprint(moderation_bp, url_prefix="/api/moderation")
    app.register_blueprint(reports_bp, url_prefix="/api/projects")
    app.register_blueprint(invitations_bp, url_prefix="/api")
    app.register_blueprint(projects_bp, url_prefix="/api/projects")
    app.register_blueprint(users_bp, url_prefix="/api/users")

    # ── Global JWT guard ──────────────────────────────────────────────────────
    @app.before_request
    def require_auth():
        if request.method == "OPTIONS":
            return None
        if request.path.startswith("/api/auth/"):
            return None
        if request.path.startswith("/api/invites/"):
            return None
        try:
            verify_jwt_in_request()
        except JWTExtendedException as exc:
            return jsonify({"error": str(exc)}), 401
        except Exception:
            return jsonify({"error": "Token de autenticação necessário"}), 401

    @app.errorhandler(NotFound)
    def handle_not_found(error):
        return error_response("Recurso não encontrado", 404)

    @app.errorhandler(BadRequest)
    def handle_bad_request(error):
        return error_response("Erro ao processar requisição", 400)

    @app.errorhandler(500)
    def handle_internal_server_error(error):
        db.session.rollback()
        return error_response("Erro interno do servidor", 500)

    return app
