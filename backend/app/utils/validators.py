import re


EMAIL_REGEX = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


def validate_required_fields(data, required_fields):
    for field in required_fields:
        value = data.get(field)
        if value is None:
            return f"{field} is required"
        if isinstance(value, str) and not value.strip():
            return f"{field} is required"
    return None


def validate_email(email):
    if not email or not EMAIL_REGEX.match(email):
        return "Invalid email format"
    return None


def validate_status(value, allowed_statuses):
    if value not in allowed_statuses:
        return "Invalid task status"
    return None


def validate_priority(value, allowed_priorities):
    if value not in allowed_priorities:
        return "Invalid task priority"
    return None


def parse_int(value, field_name):
    if value in (None, ""):
        return None

    try:
        return int(value)
    except (TypeError, ValueError) as exc:
        raise ValueError(f"{field_name} must be an integer") from exc
