from flask import current_app, render_template
from flask_mail import Message
from backend.extensions import mail
from threading import Thread


def send_async_email(app, msg):
    with app.app_context():
        try:
            mail.send(msg)
        except Exception as e:
            current_app.logger.error(f'Email error: {str(e)}')


def send_email(subject, recipients, html_body):
    from flask import current_app
    app = current_app._get_current_object()
    msg = Message(
        subject=subject,
        recipients=recipients if isinstance(recipients, list) else [recipients],
        html=html_body,
        sender=app.config.get('MAIL_USERNAME')
    )
    Thread(target=send_async_email, args=(app, msg)).start()


def send_appointment_confirmation(appointment):
    client = appointment.client
    service = appointment.service
    subject = f'Confirmación de Turno - Taller Mecánico {appointment.id}'
    html = f'''
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family:Arial;padding:20px;max-width:600px;margin:auto;">
        <div style="background:#1a1a2e;color:white;padding:20px;text-align:center;border-radius:8px 8px 0 0;">
            <h1 style="margin:0;">Taller Mecánico</h1>
        </div>
        <div style="border:1px solid #ddd;padding:20px;border-radius:0 0 8px 8px;">
            <h2>¡Turno Confirmado!</h2>
            <p>Hola <strong>{client.full_name}</strong>, tu turno ha sido reservado exitosamente.</p>
            <table style="width:100%;border-collapse:collapse;margin:20px 0;">
                <tr><td style="padding:8px;border:1px solid #ddd;"><strong>Servicio:</strong></td><td style="padding:8px;border:1px solid #ddd;">{service.name}</td></tr>
                <tr><td style="padding:8px;border:1px solid #ddd;"><strong>Fecha:</strong></td><td style="padding:8px;border:1px solid #ddd;">{appointment.appointment_date}</td></tr>
                <tr><td style="padding:8px;border:1px solid #ddd;"><strong>Hora:</strong></td><td style="padding:8px;border:1px solid #ddd;">{appointment.appointment_time}</td></tr>
                <tr><td style="padding:8px;border:1px solid #ddd;"><strong>Vehículo:</strong></td><td style="padding:8px;border:1px solid #ddd;">{appointment.vehicle_brand} {appointment.vehicle_model}</td></tr>
                <tr><td style="padding:8px;border:1px solid #ddd;"><strong>Total:</strong></td><td style="padding:8px;border:1px solid #ddd;">${appointment.total_price:.2f}</td></tr>
            </table>
            <p style="color:#666;">Si necesitas modificar o cancelar tu turno, contáctanos al <strong>+54 11 1234-5678</strong>.</p>
        </div>
    </body>
    </html>
    '''
    send_email(subject, client.email, html)


def send_contact_notification(contact_msg):
    admin_email = current_app.config.get('ADMIN_EMAIL')
    subject = f'Nuevo Mensaje de Contacto: {contact_msg.subject}'
    html = f'''
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family:Arial;padding:20px;max-width:600px;margin:auto;">
        <h2>Nuevo Mensaje de Contacto</h2>
        <table style="width:100%;border-collapse:collapse;margin:20px 0;">
            <tr><td style="padding:8px;border:1px solid #ddd;"><strong>Nombre:</strong></td><td style="padding:8px;border:1px solid #ddd;">{contact_msg.name}</td></tr>
            <tr><td style="padding:8px;border:1px solid #ddd;"><strong>Email:</strong></td><td style="padding:8px;border:1px solid #ddd;">{contact_msg.email}</td></tr>
            <tr><td style="padding:8px;border:1px solid #ddd;"><strong>Teléfono:</strong></td><td style="padding:8px;border:1px solid #ddd;">{contact_msg.phone or 'No especificado'}</td></tr>
            <tr><td style="padding:8px;border:1px solid #ddd;"><strong>Asunto:</strong></td><td style="padding:8px;border:1px solid #ddd;">{contact_msg.subject}</td></tr>
            <tr><td style="padding:8px;border:1px solid #ddd;"><strong>Mensaje:</strong></td><td style="padding:8px;border:1px solid #ddd;">{contact_msg.message}</td></tr>
        </table>
    </body>
    </html>
    '''
    send_email(subject, admin_email, html)
