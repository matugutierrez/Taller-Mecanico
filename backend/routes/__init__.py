from backend.routes.auth import auth_bp
from backend.routes.services import services_bp
from backend.routes.appointments import appointments_bp
from backend.routes.reviews import reviews_bp
from backend.routes.contact import contact_bp
from backend.routes.gallery import gallery_bp
from backend.routes.admin import admin_bp

blueprints = [
    (auth_bp, '/api/auth'),
    (services_bp, '/api/services'),
    (appointments_bp, '/api/appointments'),
    (reviews_bp, '/api/reviews'),
    (contact_bp, '/api/contact'),
    (gallery_bp, '/api/gallery'),
    (admin_bp, '/api/admin'),
]
