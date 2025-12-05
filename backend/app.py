from flask import Flask
from flask_cors import CORS
from extensions import db, jwt
from auth import auth_bp
from models import User, Inspection, InspectionPhoto
from inspections import inspections_bp

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config["JWT_SECRET_KEY"] = "super-secret-key"

CORS(app)
db.init_app(app)
jwt.init_app(app)

app.register_blueprint(auth_bp)
app.register_blueprint(inspections_bp)

with app.app_context():
    db.create_all()

if __name__ == "__main__":
    app.run(debug=True)
