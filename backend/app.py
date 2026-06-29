import os
import sys
from flask import Flask, send_from_directory, jsonify
from dotenv import load_dotenv

load_dotenv()

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))


def create_app(config_name=None):
    app = Flask(__name__, static_folder=None)

    if not config_name:
        config_name = os.getenv('FLASK_ENV', 'development')

    from backend.config import config_by_name
    app.config.from_object(config_by_name.get(config_name, config_by_name['development']))

    from backend.extensions import db, jwt, ma, cors, mail
    db.init_app(app)
    jwt.init_app(app)
    ma.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}})
    mail.init_app(app)

    from backend.routes import blueprints
    for bp, url_prefix in blueprints:
        app.register_blueprint(bp, url_prefix=url_prefix)

    @app.route('/uploads/<path:filename>')
    def uploaded_file(filename):
        upload_dir = app.config['UPLOAD_FOLDER']
        return send_from_directory(upload_dir, filename)

    @app.route('/api/health')
    def health_check():
        return jsonify({
            'status': 'healthy',
            'app': 'Taller Mecanico API',
            'version': '2.0.0'
        })

    @jwt.unauthorized_loader
    def unauthorized_response(callback):
        return jsonify({'error': 'Missing or invalid token'}), 401

    @jwt.invalid_token_loader
    def invalid_token_response(callback):
        return jsonify({'error': 'Invalid token'}), 401

    @jwt.expired_token_loader
    def expired_token_response(jwt_header, jwt_payload):
        return jsonify({'error': 'Token has expired'}), 401

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Not found'}), 404

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'error': 'Internal server error'}), 500

    with app.app_context():
        from backend.models import User, Service, Appointment, Review, ContactMessage, GalleryImage, Invoice
        db.create_all()

        admin = User.query.filter_by(email='admin@taller.com').first()
        if not admin:
            admin = User(
                email='admin@taller.com',
                username='admin',
                full_name='Administrador',
                phone='+54 11 1234-5678',
                role='admin',
                is_active=True,
                email_verified=True
            )
            admin.set_password('Admin1234')
            db.session.add(admin)
            db.session.commit()

        if Service.query.count() == 0:
            seed_services = [
                Service(name='Cambio de Aceite', slug='cambio-de-aceite',
                        description='Cambio de aceite sintético y filtro de alta calidad. Incluye revisión de niveles y lubricación general.',
                        short_description='Servicio completo de cambio de aceite sintético con filtro incluido.',
                        category='Mantenimiento', price=4500, duration_minutes=45,
                        icon='oil', is_featured=True, sort_order=1),
                Service(name='Diagnóstico Computarizado', slug='diagnostico-computarizado',
                        description='Diagnóstico electrónico completo con escáner de última generación. Detectamos fallas en motor, transmisión, frenos ABS, airbags y más.',
                        short_description='Escáner profesional para diagnóstico preciso de fallas electrónicas.',
                        category='Diagnóstico', price=3500, duration_minutes=60,
                        icon='diagnostic', is_featured=True, sort_order=2),
                Service(name='Frenos', slug='frenos',
                        description='Reemplazo de pastillas y discos de freno. Rectificación de discos, revisión de pinzas y líquido de frenos.',
                        short_description='Sistema de frenos completo: pastillas, discos, rectificación y líquido.',
                        category='Frenos', price=8500, duration_minutes=120,
                        icon='brakes', is_featured=True, sort_order=3),
                Service(name='Alineación y Balanceo', slug='alineacion-y-balanceo',
                        description='Alineación 3D computarizada y balanceo dinámico de precisión. Incluye rotación de neumáticos.',
                        short_description='Alineación 3D y balanceo dinámico con rotación de neumáticos.',
                        category='Suspensión', price=3200, duration_minutes=60,
                        icon='tires', is_featured=True, sort_order=4),
                Service(name='Reparación de Motor', slug='reparacion-de-motor',
                        description='Reparación general de motor, rectificación, cambio de pistones, anillos, válvulas, juntas y distribución completa.',
                        short_description='Reparación integral de motores nafteros y diesel.',
                        category='Motor', price=45000, duration_minutes=480,
                        icon='engine', is_featured=False, sort_order=5),
                Service(name='Transmisión y Embrague', slug='transmision-y-embrague',
                        description='Cambio de embrague completo, reparación de cajas manuales y automáticas. Incluye volante bimasa.',
                        short_description='Reparación y cambio de embrague y transmisión.',
                        category='Transmisión', price=25000, duration_minutes=360,
                        icon='gearbox', is_featured=False, sort_order=6),
                Service(name='Suspensión', slug='suspension',
                        description='Cambio de amortiguadores, espirales, bujes y parrillas. Regeneración de suspensión completa.',
                        short_description='Sistema de suspensión completo: amortiguadores, espirales y bujes.',
                        category='Suspensión', price=12000, duration_minutes=180,
                        icon='suspension', is_featured=False, sort_order=7),
                Service(name='Aire Acondicionado', slug='aire-acondicionado',
                        description='Carga de gas, reparación de fugas, cambio de compresor, limpieza de evaporador y filtro de habitáculo.',
                        short_description='Servicio completo de aire acondicionado automotor.',
                        category='Confort', price=6500, duration_minutes=90,
                        icon='ac', is_featured=True, sort_order=8),
                Service(name='Electricidad del Automóvil', slug='electricidad',
                        description='Reparación de sistemas eléctricos, alternador, arranque, sensores, centrales y multiplexado.',
                        short_description='Diagnóstico y reparación de sistemas eléctricos completos.',
                        category='Eléctrico', price=5500, duration_minutes=90,
                        icon='electrical', is_featured=False, sort_order=9),
                Service(name='Escaneo y Programación', slug='escaneo-y-programacion',
                        description='Programación de centrales, codificación de módulos, actualización de software y adaptaciones.',
                        short_description='Programación y codificación avanzada de módulos electrónicos.',
                        category='Diagnóstico', price=5000, duration_minutes=60,
                        icon='scan', is_featured=False, sort_order=10),
            ]
            db.session.add_all(seed_services)
            db.session.commit()

    return app


if __name__ == '__main__':
    app = create_app()
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
