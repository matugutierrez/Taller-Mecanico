from datetime import datetime, date, timedelta
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.extensions import db
from backend.models.user import User
from backend.models.service import Service
from backend.models.appointment import Appointment
from backend.models.review import Review
from backend.models.contact import ContactMessage
from backend.utils.decorators import admin_required

admin_bp = Blueprint('admin', __name__)


@admin_bp.route('/dashboard', methods=['GET'])
@jwt_required()
@admin_required
def dashboard():
    today = date.today()
    week_ago = today - timedelta(days=7)
    month_ago = today - timedelta(days=30)

    total_users = User.query.count()
    new_users_month = User.query.filter(User.created_at >= month_ago).count()
    total_services = Service.query.filter_by(is_active=True).count()
    total_appointments = Appointment.query.count()
    today_appointments = Appointment.query.filter(
        Appointment.appointment_date == today,
        Appointment.status.in_(['pending', 'confirmed'])
    ).count()

    pending_appointments = Appointment.query.filter_by(status='pending').count()
    completed_appointments = Appointment.query.filter_by(status='completed').count()
    cancelled_appointments = Appointment.query.filter_by(status='cancelled').count()

    total_revenue = db.session.query(db.func.sum(Appointment.total_price)).filter(
        Appointment.status == 'completed',
        Appointment.appointment_date >= month_ago
    ).scalar() or 0

    pending_reviews = Review.query.filter_by(is_approved=False).count()
    unread_messages = ContactMessage.query.filter_by(is_read=False).count()

    appointments_week = Appointment.query.filter(
        Appointment.appointment_date >= week_ago
    ).count()

    return jsonify({
        'total_users': total_users,
        'new_users_month': new_users_month,
        'total_services': total_services,
        'total_appointments': total_appointments,
        'today_appointments': today_appointments,
        'pending_appointments': pending_appointments,
        'completed_appointments': completed_appointments,
        'cancelled_appointments': cancelled_appointments,
        'total_revenue_month': round(total_revenue, 2),
        'pending_reviews': pending_reviews,
        'unread_messages': unread_messages,
        'appointments_week': appointments_week
    }), 200


@admin_bp.route('/users', methods=['GET'])
@jwt_required()
@admin_required
def manage_users():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    search = request.args.get('search')

    query = User.query
    if search:
        query = query.filter(
            User.full_name.ilike(f'%{search}%') |
            User.email.ilike(f'%{search}%') |
            User.username.ilike(f'%{search}%')
        )

    query = query.order_by(User.created_at.desc())
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        'users': [u.to_dict() for u in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    }), 200


@admin_bp.route('/users/<int:user_id>/toggle-status', methods=['PUT'])
@jwt_required()
@admin_required
def toggle_user_status(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    user.is_active = not user.is_active
    db.session.commit()
    return jsonify({
        'message': f'User {"activated" if user.is_active else "deactivated"}',
        'user': user.to_dict()
    }), 200


@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    Appointment.query.filter_by(user_id=user.id).delete()
    Review.query.filter_by(user_id=user.id).delete()
    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'User deleted'}), 200


@admin_bp.route('/appointments/calendar', methods=['GET'])
@jwt_required()
@admin_required
def calendar_data():
    start = request.args.get('start')
    end = request.args.get('end')

    query = Appointment.query.filter(
        Appointment.status.in_(['pending', 'confirmed', 'completed'])
    )

    if start:
        query = query.filter(Appointment.appointment_date >= datetime.strptime(start, '%Y-%m-%d').date())
    if end:
        query = query.filter(Appointment.appointment_date <= datetime.strptime(end, '%Y-%m-%d').date())

    appointments = query.order_by(Appointment.appointment_date, Appointment.appointment_time).all()

    events = []
    for apt in appointments:
        color_map = {
            'pending': '#f59e0b',
            'confirmed': '#3b82f6',
            'completed': '#10b981',
            'cancelled': '#ef4444'
        }
        events.append({
            'id': apt.id,
            'title': f'{apt.client.full_name} - {apt.service.name}',
            'start': f'{apt.appointment_date.isoformat()}T{apt.appointment_time.strftime("%H:%M:%S")}',
            'end': f'{apt.appointment_date.isoformat()}T{apt.end_time.strftime("%H:%M:%S")}',
            'backgroundColor': color_map.get(apt.status, '#6b7280'),
            'borderColor': color_map.get(apt.status, '#6b7280'),
            'extendedProps': apt.to_dict()
        })

    return jsonify({'events': events}), 200


@admin_bp.route('/reports/revenue', methods=['GET'])
@jwt_required()
@admin_required
def revenue_report():
    period = request.args.get('period', 'month')
    today = date.today()

    if period == 'week':
        start_date = today - timedelta(days=7)
    elif period == 'month':
        start_date = today - timedelta(days=30)
    elif period == 'quarter':
        start_date = today - timedelta(days=90)
    elif period == 'year':
        start_date = today - timedelta(days=365)
    else:
        start_date = today - timedelta(days=30)

    appointments = Appointment.query.filter(
        Appointment.appointment_date >= start_date,
        Appointment.appointment_date <= today,
        Appointment.status == 'completed'
    ).all()

    daily_revenue = {}
    for apt in appointments:
        day = apt.appointment_date.isoformat()
        daily_revenue[day] = daily_revenue.get(day, 0) + apt.total_price

    report = {
        'period': period,
        'start_date': start_date.isoformat(),
        'end_date': today.isoformat(),
        'total_revenue': round(sum(apt.total_price for apt in appointments), 2),
        'total_appointments': len(appointments),
        'daily_revenue': [{'date': k, 'revenue': round(v, 2)} for k, v in sorted(daily_revenue.items())],
        'average_per_appointment': round(
            sum(apt.total_price for apt in appointments) / len(appointments), 2
        ) if appointments else 0
    }

    return jsonify(report), 200


@admin_bp.route('/reports/services', methods=['GET'])
@jwt_required()
@admin_required
def service_report():
    services = Service.query.filter_by(is_active=True).all()
    report = []
    for service in services:
        count = Appointment.query.filter_by(
            service_id=service.id,
            status='completed'
        ).count()
        revenue = db.session.query(db.func.sum(Appointment.total_price)).filter(
            Appointment.service_id == service.id,
            Appointment.status == 'completed'
        ).scalar() or 0

        report.append({
            'service_id': service.id,
            'service_name': service.name,
            'category': service.category,
            'appointment_count': count,
            'total_revenue': round(revenue, 2)
        })

    return jsonify({
        'services': sorted(report, key=lambda x: x['appointment_count'], reverse=True)
    }), 200
