from datetime import datetime
from backend.extensions import db


class Invoice(db.Model):
    __tablename__ = 'invoices'

    id = db.Column(db.Integer, primary_key=True)
    appointment_id = db.Column(db.Integer, db.ForeignKey('appointments.id'), nullable=False)
    invoice_number = db.Column(db.String(30), unique=True, nullable=False, index=True)
    subtotal = db.Column(db.Float, nullable=False)
    tax_percentage = db.Column(db.Float, default=21.0)
    tax_amount = db.Column(db.Float, nullable=False)
    discount = db.Column(db.Float, default=0.0)
    total = db.Column(db.Float, nullable=False)
    payment_status = db.Column(db.String(30), default='pending')
    payment_date = db.Column(db.DateTime)
    payment_method = db.Column(db.String(30))
    notes = db.Column(db.Text)
    issued_at = db.Column(db.DateTime, default=datetime.utcnow)
    paid_at = db.Column(db.DateTime)

    def to_dict(self):
        return {
            'id': self.id,
            'appointment_id': self.appointment_id,
            'invoice_number': self.invoice_number,
            'subtotal': self.subtotal,
            'tax_percentage': self.tax_percentage,
            'tax_amount': self.tax_amount,
            'discount': self.discount,
            'total': self.total,
            'payment_status': self.payment_status,
            'payment_date': self.payment_date.isoformat() if self.payment_date else None,
            'payment_method': self.payment_method,
            'notes': self.notes,
            'issued_at': self.issued_at.isoformat() if self.issued_at else None,
            'paid_at': self.paid_at.isoformat() if self.paid_at else None,
        }

    def __repr__(self):
        return f'<Invoice {self.invoice_number}>'
