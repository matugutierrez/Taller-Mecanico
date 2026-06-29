from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.extensions import db
from backend.models.review import Review
from backend.models.user import User
from backend.utils.validators import validate_rating

reviews_bp = Blueprint('reviews', __name__)


@reviews_bp.route('/', methods=['GET'])
def list_reviews():
    featured = request.args.get('featured')
    approved = request.args.get('approved', 'true')
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)

    query = Review.query
    if approved.lower() == 'true':
        query = query.filter_by(is_approved=True)
    if featured and featured.lower() == 'true':
        query = query.filter_by(is_featured=True)

    query = query.order_by(Review.created_at.desc())
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        'reviews': [r.to_dict() for r in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page,
        'average_rating': db.session.query(db.func.avg(Review.rating)).filter(
            Review.is_approved == True
        ).scalar() or 0
    }), 200


@reviews_bp.route('/', methods=['POST'])
@jwt_required()
def create_review():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    if not data.get('comment') or not data.get('rating'):
        return jsonify({'error': 'Rating and comment are required'}), 400

    if not validate_rating(data['rating']):
        return jsonify({'error': 'Rating must be between 1 and 5'}), 400

    review = Review(
        user_id=user.id,
        rating=int(data['rating']),
        comment=data['comment'].strip(),
        service_used=data.get('service_used', ''),
        is_approved=False
    )

    db.session.add(review)
    db.session.commit()

    return jsonify({'message': 'Review submitted for approval', 'review': review.to_dict()}), 201


@reviews_bp.route('/<int:review_id>', methods=['PUT'])
@jwt_required()
def update_review(review_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    review = Review.query.get(review_id)

    if not review:
        return jsonify({'error': 'Review not found'}), 404
    if user.role != 'admin' and review.user_id != user.id:
        return jsonify({'error': 'Access denied'}), 403

    data = request.get_json()
    if data.get('comment'):
        review.comment = data['comment'].strip()
    if data.get('rating') and validate_rating(data['rating']):
        review.rating = int(data['rating'])

    if user.role == 'admin':
        if data.get('is_approved') is not None:
            review.is_approved = data['is_approved']
        if data.get('is_featured') is not None:
            review.is_featured = data['is_featured']

    db.session.commit()
    return jsonify({'message': 'Review updated', 'review': review.to_dict()}), 200


@reviews_bp.route('/<int:review_id>', methods=['DELETE'])
@jwt_required()
def delete_review(review_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    review = Review.query.get(review_id)

    if not review:
        return jsonify({'error': 'Review not found'}), 404
    if user.role != 'admin' and review.user_id != user.id:
        return jsonify({'error': 'Access denied'}), 403

    db.session.delete(review)
    db.session.commit()
    return jsonify({'message': 'Review deleted'}), 200
