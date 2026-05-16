from flask import Flask
from werkzeug.exceptions import BadRequest, NotFound
from .config import Config
from .extensions import db, migrate, cors
from .utils.responses import error_response

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    migrate.init_app(app, db)
    cors.init_app(app)

    from .contacts.routes import contacts_bp
    from .dashboard.routes import dashboard_bp
    from .tasks.routes import tasks_bp
    from .teams.routes import teams_bp

    app.register_blueprint(contacts_bp, url_prefix="/api/contacts")
    app.register_blueprint(dashboard_bp, url_prefix="/api/dashboard")
    app.register_blueprint(tasks_bp, url_prefix="/api/tasks")
    app.register_blueprint(teams_bp, url_prefix="/api/teams")

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
