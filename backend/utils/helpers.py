import os
import uuid
from datetime import datetime, date, time, timedelta
from werkzeug.utils import secure_filename
from flask import current_app


def allowed_file(filename):
    allowed = current_app.config.get('ALLOWED_EXTENSIONS', {'png', 'jpg', 'jpeg', 'gif', 'webp'})
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed


def save_upload(file, subfolder=''):
    if not file or not allowed_file(file.filename):
        return None
    ext = file.filename.rsplit('.', 1)[1].lower()
    unique_name = f"{uuid.uuid4().hex}_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}.{ext}"
    upload_dir = os.path.join(current_app.config['UPLOAD_FOLDER'], subfolder)
    os.makedirs(upload_dir, exist_ok=True)
    filepath = os.path.join(upload_dir, unique_name)
    file.save(filepath)
    return f'/uploads/{subfolder}/{unique_name}' if not subfolder else f'/uploads/{subfolder}/{unique_name}'


def generate_invoice_number():
    prefix = 'FAC'
    date_part = datetime.utcnow().strftime('%Y%m')
    random_part = uuid.uuid4().hex[:6].upper()
    return f'{prefix}-{date_part}-{random_part}'


def get_available_slots(service_duration, date_obj, booked_slots):
    start_hour = 8
    end_hour = 18
    interval = 30
    slots = []
    current_time = time(start_hour, 0)
    end_time = time(end_hour, 0)

    while current_time < end_time:
        slot_start = current_time
        hour = current_time.hour + (current_time.minute + service_duration) // 60
        minute = (current_time.minute + service_duration) % 60
        slot_end = time(hour, minute) if hour < 24 else time(23, 59)

        is_booked = any(
            bs[0] <= slot_start < bs[1] or bs[0] < slot_end <= bs[1] or
            (slot_start <= bs[0] and slot_end >= bs[1])
            for bs in booked_slots
        )

        if not is_booked and slot_end <= end_time:
            slots.append({
                'time': slot_start.strftime('%H:%M'),
                'end_time': slot_end.strftime('%H:%M'),
                'available': True
            })

        minutes = current_time.minute + interval
        current_time = time(current_time.hour + minutes // 60, minutes % 60)

    return slots
