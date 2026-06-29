from datetime import datetime
from backend.extensions import db


class Service(db.Model):
    __tablename__ = 'services'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    slug = db.Column(db.String(150), unique=True, nullable=False, index=True)
    description = db.Column(db.Text, nullable=False)
    short_description = db.Column(db.String(300))
    category = db.Column(db.String(50), nullable=False)
    price = db.Column(db.Float, nullable=False)
    discount_price = db.Column(db.Float)
    duration_minutes = db.Column(db.Integer, nullable=False)
    image_url = db.Column(db.String(500))
    icon = db.Column(db.String(50))
    is_featured = db.Column(db.Boolean, default=False)
    is_active = db.Column(db.Boolean, default=True)
    sort_order = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    appointments = db.relationship('Appointment', backref='service', lazy='dynamic')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'slug': self.slug,
            'description': self.description,
            'short_description': self.short_description,
            'category': self.category,
            'price': self.price,
            'discount_price': self.discount_price,
            'duration_minutes': self.duration_minutes,
            'image_url': self.image_url,
            'icon': self.icon,
            'is_featured': self.is_featured,
            'is_active': self.is_active,
            'sort_order': self.sort_order,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self):
        return f'<Service {self.name}>'
