from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.extensions import db
from backend.models.gallery import GalleryImage
from backend.models.user import User
from backend.utils.helpers import save_upload

gallery_bp = Blueprint('gallery', __name__)


@gallery_bp.route('/', methods=['GET'])
def list_gallery():
    category = request.args.get('category')
    featured = request.args.get('featured')
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 30, type=int)

    query = GalleryImage.query
    if category:
        query = query.filter_by(category=category)
    if featured and featured.lower() == 'true':
        query = query.filter_by(is_featured=True)

    query = query.order_by(GalleryImage.sort_order, GalleryImage.created_at.desc())
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        'images': [img.to_dict() for img in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    }), 200


@gallery_bp.route('/', methods=['POST'])
@jwt_required()
def upload_image():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user or user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    if not request.files or not request.files.get('image'):
        return jsonify({'error': 'Image file is required'}), 400

    image_url = save_upload(request.files['image'], 'gallery')
    if not image_url:
        return jsonify({'error': 'Invalid image file'}), 400

    data = request.form.to_dict()
    image = GalleryImage(
        title=data.get('title', ''),
        description=data.get('description', ''),
        image_url=image_url,
        alt_text=data.get('alt_text', ''),
        category=data.get('category', 'general'),
        is_featured=data.get('is_featured', 'false').lower() == 'true',
        sort_order=int(data.get('sort_order', 0))
    )

    db.session.add(image)
    db.session.commit()

    return jsonify({'message': 'Image uploaded', 'image': image.to_dict()}), 201


@gallery_bp.route('/<int:image_id>', methods=['PUT'])
@jwt_required()
def update_image(image_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user or user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    image = GalleryImage.query.get(image_id)
    if not image:
        return jsonify({'error': 'Image not found'}), 404

    data = request.form.to_dict() if request.form else request.get_json()
    if data.get('title') is not None:
        image.title = data['title']
    if data.get('description') is not None:
        image.description = data['description']
    if data.get('alt_text') is not None:
        image.alt_text = data['alt_text']
    if data.get('category') is not None:
        image.category = data['category']
    if data.get('is_featured') is not None:
        image.is_featured = data['is_featured'].lower() == 'true'
    if data.get('sort_order') is not None:
        image.sort_order = int(data['sort_order'])

    if request.files and request.files.get('image'):
        image.image_url = save_upload(request.files['image'], 'gallery')

    db.session.commit()
    return jsonify({'message': 'Image updated', 'image': image.to_dict()}), 200


@gallery_bp.route('/<int:image_id>', methods=['DELETE'])
@jwt_required()
def delete_image(image_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user or user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403

    image = GalleryImage.query.get(image_id)
    if not image:
        return jsonify({'error': 'Image not found'}), 404

    db.session.delete(image)
    db.session.commit()
    return jsonify({'message': 'Image deleted'}), 200
