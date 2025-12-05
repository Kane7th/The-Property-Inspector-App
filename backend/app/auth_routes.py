from flask import Blueprint, request, jsonify
from .extensions import db
from .models import User
from flask_jwt_extended import create_access_token
from werkzeug.security import generate_password_hash, check_password_hash


auth_bp = Blueprint('auth', __name__)


@auth_bp.post('/register')
def register():
    data = request.json
    email = data.get('email')
    password = data.get('password')


    if User.query.filter_by(email=email).first():
        return jsonify({'msg': 'User already exists'}), 400


    hashed = generate_password_hash(password)
    new_user = User(email=email, password=hashed)


    db.session.add(new_user)
    db.session.commit()


    return jsonify({'msg': 'Account created'}), 201


@auth_bp.post('/login')
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')


    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password, password):
        return jsonify({'msg': 'Invalid credentials'}), 401


    token = create_access_token(identity=str(user.id))


    return jsonify({'token': token, 'user_id': user.id})