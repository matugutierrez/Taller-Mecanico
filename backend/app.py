import os
from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__, template_folder='templates', static_folder='../static', static_url_path='/static')
app.secret_key = 'taller-mecanico-secret-key-2024'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///taller.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)


class ContactMessage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20))
    message = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    read = db.Column(db.Boolean, default=False)


with app.app_context():
    db.create_all()


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/contact', methods=['POST'])
def contact():
    data = request.get_json()
    msg = ContactMessage(
        name=data.get('name'),
        email=data.get('email'),
        phone=data.get('phone', ''),
        message=data.get('message')
    )
    db.session.add(msg)
    db.session.commit()
    return jsonify({'ok': True, 'message': 'Mensaje enviado correctamente'})


@app.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    if request.method == 'POST':
        data = request.get_json() if request.is_json else request.form
        if data.get('username') == 'admin' and data.get('password') == 'taller2024':
            session['admin'] = True
            return jsonify({'ok': True})
        return jsonify({'ok': False, 'message': 'Credenciales incorrectas'}), 401
    return render_template('login.html')


@app.route('/admin/logout')
def admin_logout():
    session.pop('admin', None)
    return redirect(url_for('admin_login'))


@app.route('/admin')
def admin_panel():
    if not session.get('admin'):
        return redirect(url_for('admin_login'))
    messages = ContactMessage.query.order_by(ContactMessage.created_at.desc()).all()
    return render_template('admin.html', messages=messages)


@app.route('/api/admin/messages/<int:msg_id>/read', methods=['POST'])
def mark_read(msg_id):
    if not session.get('admin'):
        return jsonify({'ok': False}), 401
    msg = ContactMessage.query.get_or_404(msg_id)
    msg.read = True
    db.session.commit()
    return jsonify({'ok': True})


@app.route('/api/admin/messages/<int:msg_id>', methods=['DELETE'])
def delete_message(msg_id):
    if not session.get('admin'):
        return jsonify({'ok': False}), 401
    msg = ContactMessage.query.get_or_404(msg_id)
    db.session.delete(msg)
    db.session.commit()
    return jsonify({'ok': True})


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
