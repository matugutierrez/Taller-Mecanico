from datetime import datetime
from backend.extensions import db


class GalleryImage(db.Model):
    __tablename__ = 'gallery_images'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150))
    description = db.Column(db.Text)
    image_url = db.Column(db.String(500), nullable=False)
    alt_text = db.Column(db.String(200))
    category = db.Column(db.String(50))
    is_featured = db.Column(db.Boolean, default=False)
    sort_order = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'image_url': self.image_url,
            'alt_text': self.alt_text,
            'category': self.category,
            'is_featured': self.is_featured,
            'sort_order': self.sort_order,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self):
        return f'<GalleryImage {self.id}>'
