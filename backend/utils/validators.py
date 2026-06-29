import re
from datetime import datetime, date


def validate_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


def validate_phone(phone):
    pattern = r'^\+?1?\d{7,15}$'
    return re.match(pattern, phone.replace(' ', '').replace('-', '')) is not None


def validate_password(password):
    if len(password) < 8:
        return False, 'Password must be at least 8 characters'
    if not re.search(r'[A-Z]', password):
        return False, 'Password must contain an uppercase letter'
    if not re.search(r'[a-z]', password):
        return False, 'Password must contain a lowercase letter'
    if not re.search(r'[0-9]', password):
        return False, 'Password must contain a number'
    return True, 'Valid password'


def validate_license_plate(plate):
    pattern = r'^[A-Z]{2,3}\s?\d{3,4}$'
    return re.match(pattern, plate.upper()) is not None


def validate_appointment_date(appointment_date):
    if isinstance(appointment_date, str):
        try:
            appointment_date = datetime.strptime(appointment_date, '%Y-%m-%d').date()
        except ValueError:
            return False, 'Invalid date format. Use YYYY-MM-DD'
    if appointment_date < date.today():
        return False, 'Appointment date cannot be in the past'
    return True, 'Valid date'


def sanitize_html(text):
    import bleach
    allowed_tags = ['b', 'i', 'u', 'strong', 'em', 'br', 'p']
    return bleach.clean(text, tags=allowed_tags, strip=True)


def validate_rating(rating):
    try:
        rating = int(rating)
        return 1 <= rating <= 5
    except (ValueError, TypeError):
        return False
