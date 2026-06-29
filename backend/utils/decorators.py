from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt_identity


def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        current_user_id = get_jwt_identity()
        from backend.models.user import User
        user = User.query.get(current_user_id)
        if not user or user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        return f(*args, **kwargs)
    return decorated_function


def client_or_admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        current_user_id = get_jwt_identity()
        from backend.models.user import User
        user = User.query.get(current_user_id)
        if not user or user.role not in ('client', 'admin'):
            return jsonify({'error': 'Authentication required'}), 403
        return f(*args, **kwargs)
    return decorated_function
