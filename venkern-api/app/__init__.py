from flask import Flask
from .config import Config
from .extensions import db, migrate, cors

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    migrate.init_app(app, db)
    cors.init_app(app)

    from .contacts.routes import contacts_bp
    from .teams.routes import teams_bp

    app.register_blueprint(contacts_bp, url_prefix="/api/contacts")
    app.register_blueprint(teams_bp, url_prefix="/api/teams")

    return app
