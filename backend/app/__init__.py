from flask import Flask
from .extensions import db, jwt, cors
from config import Config
from .auth_routes import auth_bp
from .inspection_routes import inspection_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)


    db.init_app(app)
    jwt.init_app(app)
    cors.init_app(app)


    with app.app_context():
        db.create_all()


    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(inspection_bp, url_prefix="/inspection")


    return app