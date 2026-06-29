from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.extensions import db
from backend.models.service import Service
from backend.models.user import User
from backend.utils.helpers import save_upload

services_bp = Blueprint('services', __name__)


@services_bp.route('/', methods=['GET'])
def list_services():
    category = request.args.get('category')
    featured = request.args.get('featured')
    search = request.args.get('search')
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)

    query = Service.query.filter_by(is_active=True)

    if category:
        query = query.filter_by(category=category)
    if featured and featured.lower() == 'true':
        query = query.filter_by(is_featured=True)
    if search:
        query = query.filter(
            Service.name.ilike(f'%{search}%') |
            Service.description.ilike(f'%{search}%')
        )

    query = query.order_by(Service.sort_order, Service.name)
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        'services': [s.to_dict() for s in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    }), 200


@services_bp.route('/<slug>', methods=['GET'])
def get_service(slug):
    service = Service.query.filter_by(slug=slug, is_active=True).first()
    if not service:
        return jsonify({'error': 'Service not found'}), 404
    return jsonify({'service': service.to_dict()}), 200


@services_bp.route('/', methods=['POST'])
@jwt_required()
def create_service():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user or user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    data = request.form.to_dict() if request.form else request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    required = ['name', 'description', 'category', 'price', 'duration_minutes']
    for field in required:
        if field not in data or not data.get(field):
            return jsonify({'error': f'{field} is required'}), 400

    image_url = None
    if request.files and request.files.get('image'):
        image_url = save_upload(request.files['image'], 'services')

    slug = data.get('slug', data['name'].lower().replace(' ', '-'))
    existing = Service.query.filter_by(slug=slug).first()
    if existing:
        slug = f'{slug}-{db.session.query(Service).count() + 1}'

    service = Service(
        name=data['name'],
        slug=slug,
        description=data['description'],
        short_description=data.get('short_description', ''),
        category=data['category'],
        price=float(data['price']),
        discount_price=float(data['discount_price']) if data.get('discount_price') else None,
        duration_minutes=int(data['duration_minutes']),
        image_url=image_url or data.get('image_url'),
        icon=data.get('icon'),
        is_featured=data.get('is_featured', 'false').lower() == 'true',
        is_active=data.get('is_active', 'true').lower() == 'true',
        sort_order=int(data.get('sort_order', 0))
    )

    db.session.add(service)
    db.session.commit()

    return jsonify({'message': 'Service created', 'service': service.to_dict()}), 201


@services_bp.route('/<int:service_id>', methods=['PUT'])
@jwt_required()
def update_service(service_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user or user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    service = Service.query.get(service_id)
    if not service:
        return jsonify({'error': 'Service not found'}), 404

    data = request.form.to_dict() if request.form else request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    if data.get('name'):
        service.name = data['name']
    if data.get('description'):
        service.description = data['description']
    if data.get('short_description') is not None:
        service.short_description = data['short_description']
    if data.get('category'):
        service.category = data['category']
    if data.get('price'):
        service.price = float(data['price'])
    if data.get('discount_price') is not None:
        service.discount_price = float(data['discount_price']) if data['discount_price'] else None
    if data.get('duration_minutes'):
        service.duration_minutes = int(data['duration_minutes'])
    if data.get('icon'):
        service.icon = data['icon']
    if data.get('is_featured') is not None:
        service.is_featured = data['is_featured'].lower() == 'true'
    if data.get('is_active') is not None:
        service.is_active = data['is_active'].lower() == 'true'
    if data.get('sort_order') is not None:
        service.sort_order = int(data['sort_order'])

    if request.files and request.files.get('image'):
        service.image_url = save_upload(request.files['image'], 'services')

    db.session.commit()
    return jsonify({'message': 'Service updated', 'service': service.to_dict()}), 200


@services_bp.route('/<int:service_id>', methods=['DELETE'])
@jwt_required()
def delete_service(service_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user or user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    service = Service.query.get(service_id)
    if not service:
        return jsonify({'error': 'Service not found'}), 404

    service.is_active = False
    db.session.commit()
    return jsonify({'message': 'Service deactivated'}), 200


@services_bp.route('/categories', methods=['GET'])
def get_categories():
    categories = db.session.query(Service.category).distinct().all()
    return jsonify({
        'categories': [c[0] for c in categories if c[0]]
    }), 200
