from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'  # or your DB
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

CORS(app)

# Link SQLAlchemy instance to app
from backend.models import db  # import db from your models file
db.init_app(app)

# Blueprints
from backend.auth import auth_bp
from backend.inspections import inspections_bp

app.register_blueprint(auth_bp, url_prefix="/auth")
app.register_blueprint(inspections_bp, url_prefix="/inspections")

if __name__ == "__main__":
    with app.app_context():  # ensure db can access app context
        db.create_all()
    app.run(debug=True)
