from datetime import datetime
from backend.extensions import db


class Appointment(db.Model):
    __tablename__ = 'appointments'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    service_id = db.Column(db.Integer, db.ForeignKey('services.id'), nullable=False)
    status = db.Column(db.String(30), default='pending', index=True)
    appointment_date = db.Column(db.Date, nullable=False, index=True)
    appointment_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=False)
    vehicle_brand = db.Column(db.String(50), nullable=False)
    vehicle_model = db.Column(db.String(50), nullable=False)
    vehicle_year = db.Column(db.Integer)
    vehicle_license = db.Column(db.String(20))
    notes = db.Column(db.Text)
    total_price = db.Column(db.Float, nullable=False)
    is_paid = db.Column(db.Boolean, default=False)
    payment_method = db.Column(db.String(30))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    invoice = db.relationship('Invoice', backref='appointment', uselist=False)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'client_name': self.client.full_name if self.client else None,
            'client_email': self.client.email if self.client else None,
            'client_phone': self.client.phone if self.client else None,
            'service_id': self.service_id,
            'service_name': self.service.name if self.service else None,
            'status': self.status,
            'appointment_date': self.appointment_date.isoformat() if self.appointment_date else None,
            'appointment_time': self.appointment_time.strftime('%H:%M') if self.appointment_time else None,
            'end_time': self.end_time.strftime('%H:%M') if self.end_time else None,
            'vehicle_brand': self.vehicle_brand,
            'vehicle_model': self.vehicle_model,
            'vehicle_year': self.vehicle_year,
            'vehicle_license': self.vehicle_license,
            'notes': self.notes,
            'total_price': self.total_price,
            'is_paid': self.is_paid,
            'payment_method': self.payment_method,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self):
        return f'<Appointment {self.id} - {self.status}>'
