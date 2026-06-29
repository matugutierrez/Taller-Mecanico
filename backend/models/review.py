from datetime import datetime
from backend.extensions import db


class Review(db.Model):
    __tablename__ = 'reviews'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    comment = db.Column(db.Text, nullable=False)
    service_used = db.Column(db.String(150))
    is_approved = db.Column(db.Boolean, default=False)
    is_featured = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'author_name': self.author.full_name if self.author else 'Anónimo',
            'author_avatar': self.author.avatar_url if self.author else None,
            'rating': self.rating,
            'comment': self.comment,
            'service_used': self.service_used,
            'is_approved': self.is_approved,
            'is_featured': self.is_featured,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self):
        return f'<Review {self.id} - {self.rating} stars>'
