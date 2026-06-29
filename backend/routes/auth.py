from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from backend.extensions import db
from backend.models.user import User
from backend.utils.validators import validate_email, validate_password

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    required = ['email', 'username', 'password', 'full_name']
    for field in required:
        if field not in data or not data[field].strip():
            return jsonify({'error': f'{field} is required'}), 400

    if not validate_email(data['email']):
        return jsonify({'error': 'Invalid email format'}), 400

    valid, msg = validate_password(data['password'])
    if not valid:
        return jsonify({'error': msg}), 400

    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 409
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already taken'}), 409

    user = User(
        email=data['email'].lower(),
        username=data['username'].lower(),
        full_name=data['full_name'].strip(),
        phone=data.get('phone', ''),
        role='client'
    )
    user.set_password(data['password'])

    db.session.add(user)
    db.session.commit()

    access_token = create_access_token(identity=user.id, additional_claims={'role': user.role})
    refresh_token = create_refresh_token(identity=user.id)

    return jsonify({
        'message': 'User registered successfully',
        'user': user.to_dict(),
        'access_token': access_token,
        'refresh_token': refresh_token
    }), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password are required'}), 400

    user = User.query.filter_by(email=data['email'].lower()).first()
    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Invalid credentials'}), 401

    if not user.is_active:
        return jsonify({'error': 'Account is disabled'}), 403

    user.last_login = datetime.utcnow()
    db.session.commit()

    access_token = create_access_token(identity=user.id, additional_claims={'role': user.role})
    refresh_token = create_refresh_token(identity=user.id)

    return jsonify({
        'message': 'Login successful',
        'user': user.to_dict(),
        'access_token': access_token,
        'refresh_token': refresh_token
    }), 200


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    access_token = create_access_token(identity=user.id, additional_claims={'role': user.role})
    return jsonify({'access_token': access_token}), 200


@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({'user': user.to_dict()}), 200


@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json()
    if data.get('full_name'):
        user.full_name = data['full_name'].strip()
    if data.get('phone'):
        user.phone = data['phone']
    if data.get('avatar_url'):
        user.avatar_url = data['avatar_url']

    db.session.commit()
    return jsonify({'message': 'Profile updated', 'user': user.to_dict()}), 200


@auth_bp.route('/change-password', methods=['PUT'])
@jwt_required()
def change_password():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json()
    if not data.get('current_password') or not data.get('new_password'):
        return jsonify({'error': 'Current and new password are required'}), 400

    if not user.check_password(data['current_password']):
        return jsonify({'error': 'Current password is incorrect'}), 401

    valid, msg = validate_password(data['new_password'])
    if not valid:
        return jsonify({'error': msg}), 400

    user.set_password(data['new_password'])
    db.session.commit()
    return jsonify({'message': 'Password changed successfully'}), 200


@auth_bp.route('/users', methods=['GET'])
@jwt_required()
def list_users():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user or user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    users = User.query.order_by(User.created_at.desc()).all()
    return jsonify({'users': [u.to_dict() for u in users]}), 200
