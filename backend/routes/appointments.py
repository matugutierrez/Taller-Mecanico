from datetime import datetime, date, time
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.extensions import db
from backend.models.appointment import Appointment
from backend.models.service import Service
from backend.models.user import User
from backend.models.invoice import Invoice
from backend.utils.decorators import admin_required, client_or_admin_required
from backend.utils.helpers import generate_invoice_number, get_available_slots
from backend.utils.email_service import send_appointment_confirmation

appointments_bp = Blueprint('appointments', __name__)


@appointments_bp.route('/', methods=['GET'])
@jwt_required()
def list_appointments():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if not user:
        return jsonify({'error': 'User not found'}), 404

    status_filter = request.args.get('status')
    date_from = request.args.get('date_from')
    date_to = request.args.get('date_to')
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)

    if user.role == 'admin':
        query = Appointment.query
    else:
        query = Appointment.query.filter_by(user_id=user.id)

    if status_filter:
        query = query.filter_by(status=status_filter)
    if date_from:
        query = query.filter(Appointment.appointment_date >= datetime.strptime(date_from, '%Y-%m-%d').date())
    if date_to:
        query = query.filter(Appointment.appointment_date <= datetime.strptime(date_to, '%Y-%m-%d').date())

    query = query.order_by(Appointment.appointment_date.desc(), Appointment.appointment_time.desc())
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        'appointments': [a.to_dict() for a in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    }), 200


@appointments_bp.route('/<int:appointment_id>', methods=['GET'])
@jwt_required()
def get_appointment(appointment_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    appointment = Appointment.query.get(appointment_id)

    if not appointment:
        return jsonify({'error': 'Appointment not found'}), 404

    if user.role != 'admin' and appointment.user_id != user.id:
        return jsonify({'error': 'Access denied'}), 403

    result = appointment.to_dict()
    if appointment.invoice:
        result['invoice'] = appointment.invoice.to_dict()

    return jsonify({'appointment': result}), 200


@appointments_bp.route('/', methods=['POST'])
@jwt_required()
def create_appointment():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    required = ['service_id', 'appointment_date', 'appointment_time',
                'vehicle_brand', 'vehicle_model']
    for field in required:
        if field not in data or not data.get(field):
            return jsonify({'error': f'{field} is required'}), 400

    service = Service.query.get(data['service_id'])
    if not service or not service.is_active:
        return jsonify({'error': 'Service not found or inactive'}), 404

    try:
        app_date = datetime.strptime(data['appointment_date'], '%Y-%m-%d').date()
        app_time = datetime.strptime(data['appointment_time'], '%H:%M').time()
    except ValueError:
        return jsonify({'error': 'Invalid date/time format'}), 400

    if app_date < date.today():
        return jsonify({'error': 'Cannot book in the past'}), 400

    duration = service.duration_minutes
    end_hour = app_time.hour + (app_time.minute + duration) // 60
    end_minute = (app_time.minute + duration) % 60
    end_time = time(end_hour, end_minute)

    conflict = Appointment.query.filter(
        Appointment.appointment_date == app_date,
        Appointment.status.in_(['pending', 'confirmed']),
        Appointment.appointment_time < end_time,
        Appointment.end_time > app_time
    ).first()

    if conflict:
        return jsonify({'error': 'Time slot not available'}), 409

    appointment = Appointment(
        user_id=user.id,
        service_id=service.id,
        appointment_date=app_date,
        appointment_time=app_time,
        end_time=end_time,
        vehicle_brand=data['vehicle_brand'].upper(),
        vehicle_model=data['vehicle_model'].upper(),
        vehicle_year=int(data['vehicle_year']) if data.get('vehicle_year') else None,
        vehicle_license=data.get('vehicle_license', '').upper(),
        notes=data.get('notes', ''),
        total_price=service.discount_price or service.price,
        status='pending'
    )

    db.session.add(appointment)
    db.session.commit()

    invoice = Invoice(
        appointment_id=appointment.id,
        invoice_number=generate_invoice_number(),
        subtotal=appointment.total_price,
        tax_percentage=21.0,
        tax_amount=round(appointment.total_price * 0.21, 2),
        total=round(appointment.total_price * 1.21, 2),
        payment_status='pending'
    )
    db.session.add(invoice)
    db.session.commit()

    try:
        send_appointment_confirmation(appointment)
    except Exception as e:
        pass

    return jsonify({
        'message': 'Appointment created',
        'appointment': appointment.to_dict(),
        'invoice': invoice.to_dict()
    }), 201


@appointments_bp.route('/<int:appointment_id>', methods=['PUT'])
@jwt_required()
def update_appointment(appointment_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    appointment = Appointment.query.get(appointment_id)

    if not appointment:
        return jsonify({'error': 'Appointment not found'}), 404
    if user.role != 'admin' and appointment.user_id != user.id:
        return jsonify({'error': 'Access denied'}), 403

    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    if user.role == 'admin':
        if data.get('status'):
            appointment.status = data['status']
        if data.get('is_paid') is not None:
            appointment.is_paid = data['is_paid']
        if data.get('payment_method'):
            appointment.payment_method = data['payment_method']

    if data.get('notes') is not None:
        appointment.notes = data['notes']

    db.session.commit()
    return jsonify({'message': 'Appointment updated', 'appointment': appointment.to_dict()}), 200


@appointments_bp.route('/<int:appointment_id>', methods=['DELETE'])
@jwt_required()
def cancel_appointment(appointment_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    appointment = Appointment.query.get(appointment_id)

    if not appointment:
        return jsonify({'error': 'Appointment not found'}), 404
    if user.role != 'admin' and appointment.user_id != user.id:
        return jsonify({'error': 'Access denied'}), 403

    appointment.status = 'cancelled'
    db.session.commit()
    return jsonify({'message': 'Appointment cancelled'}), 200


@appointments_bp.route('/available-slots', methods=['GET'])
def get_available_slots_endpoint():
    service_id = request.args.get('service_id', type=int)
    date_str = request.args.get('date')

    if not service_id or not date_str:
        return jsonify({'error': 'service_id and date are required'}), 400

    service = Service.query.get(service_id)
    if not service:
        return jsonify({'error': 'Service not found'}), 404

    try:
        app_date = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'error': 'Invalid date format'}), 400

    booked = Appointment.query.filter(
        Appointment.appointment_date == app_date,
        Appointment.status.in_(['pending', 'confirmed'])
    ).all()

    booked_slots = [(b.appointment_time, b.end_time) for b in booked]
    slots = get_available_slots(service.duration_minutes, app_date, booked_slots)

    return jsonify({'slots': slots}), 200


@appointments_bp.route('/stats', methods=['GET'])
@jwt_required()
def appointment_stats():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user or user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    total = Appointment.query.count()
    pending = Appointment.query.filter_by(status='pending').count()
    confirmed = Appointment.query.filter_by(status='confirmed').count()
    completed = Appointment.query.filter_by(status='completed').count()
    cancelled = Appointment.query.filter_by(status='cancelled').count()
    today = Appointment.query.filter(
        Appointment.appointment_date == date.today(),
        Appointment.status.in_(['pending', 'confirmed'])
    ).count()

    return jsonify({
        'total': total,
        'pending': pending,
        'confirmed': confirmed,
        'completed': completed,
        'cancelled': cancelled,
        'today': today
    }), 200
