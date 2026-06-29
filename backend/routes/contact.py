from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.extensions import db
from backend.models.contact import ContactMessage
from backend.models.user import User
from backend.utils.validators import validate_email
from backend.utils.email_service import send_contact_notification

contact_bp = Blueprint('contact', __name__)


@contact_bp.route('/', methods=['POST'])
def send_message():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    required = ['name', 'email', 'subject', 'message']
    for field in required:
        if field not in data or not data.get(field, '').strip():
            return jsonify({'error': f'{field} is required'}), 400

    if not validate_email(data['email']):
        return jsonify({'error': 'Invalid email format'}), 400

    contact_msg = ContactMessage(
        name=data['name'].strip(),
        email=data['email'].lower().strip(),
        phone=data.get('phone', ''),
        subject=data['subject'].strip(),
        message=data['message'].strip()
    )

    db.session.add(contact_msg)
    db.session.commit()

    try:
        send_contact_notification(contact_msg)
    except Exception:
        pass

    return jsonify({
        'message': 'Message sent successfully. We will contact you soon.',
        'contact_message': contact_msg.to_dict()
    }), 201


@contact_bp.route('/', methods=['GET'])
@jwt_required()
def list_messages():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user or user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    unread = request.args.get('unread')

    query = ContactMessage.query
    if unread and unread.lower() == 'true':
        query = query.filter_by(is_read=False)

    query = query.order_by(ContactMessage.created_at.desc())
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        'messages': [m.to_dict() for m in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page,
        'unread_count': ContactMessage.query.filter_by(is_read=False).count()
    }), 200


@contact_bp.route('/<int:message_id>/read', methods=['PUT'])
@jwt_required()
def mark_as_read(message_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user or user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    message = ContactMessage.query.get(message_id)
    if not message:
        return jsonify({'error': 'Message not found'}), 404

    message.is_read = True
    db.session.commit()
    return jsonify({'message': 'Marked as read'}), 200


@contact_bp.route('/<int:message_id>/reply', methods=['PUT'])
@jwt_required()
def mark_as_replied(message_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user or user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    message = ContactMessage.query.get(message_id)
    if not message:
        return jsonify({'error': 'Message not found'}), 404

    message.is_replied = True
    message.is_read = True
    db.session.commit()
    return jsonify({'message': 'Marked as replied'}), 200


@contact_bp.route('/<int:message_id>', methods=['DELETE'])
@jwt_required()
def delete_message(message_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user or user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    message = ContactMessage.query.get(message_id)
    if not message:
        return jsonify({'error': 'Message not found'}), 404

    db.session.delete(message)
    db.session.commit()
    return jsonify({'message': 'Message deleted'}), 200
