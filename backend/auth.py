from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from extensions import db
from models import User

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.json or {}
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"msg": "Email and password are required"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"msg": "User already exists"}), 400

    hashed = generate_password_hash(password)
    new_user = User(email=email, password=hashed)

    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"msg": "Account created"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Error creating account", "error": str(e)}), 500


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json or {}
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"msg": "Email and password are required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password, password):
        return jsonify({"msg": "Invalid credentials"}), 401

    # Ensure JWT identity is always a string (or int)
    token = create_access_token(identity=str(user.id))
    return jsonify({"token": token, "user_id": user.id})


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    current_id = get_jwt_identity()
    if not current_id:
        return jsonify({"msg": "Invalid token"}), 401

    user = User.query.get(int(current_id))
    if not user:
        return jsonify({"msg": "User not found"}), 404

    return jsonify({"id": user.id, "email": user.email})
