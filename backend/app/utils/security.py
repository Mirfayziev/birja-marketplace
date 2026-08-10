"""Parol, buyurtma raqami va rolga asoslangan ruxsatlar uchun yordamchi funksiyalar."""
import random
import string
from functools import wraps

from flask import jsonify
from flask_jwt_extended import get_jwt, verify_jwt_in_request
from werkzeug.security import generate_password_hash, check_password_hash

from app.models import UserRole


def hash_password(raw_password: str) -> str:
    return generate_password_hash(raw_password)


def verify_password(raw_password: str, password_hash: str) -> bool:
    return check_password_hash(password_hash, raw_password)


def generate_order_number() -> str:
    """Masalan: ORD-8K3F9A"""
    suffix = "".join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"ORD-{suffix}"


def roles_required(*allowed_roles: UserRole):
    """
    Endpointni faqat ko'rsatilgan rollarga ruxsat berish uchun dekorator.
    Foydalanish: @roles_required(UserRole.ADMIN, UserRole.SUPERADMIN)
    """

    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            user_role = claims.get("role")
            if user_role not in [r.value for r in allowed_roles]:
                return jsonify({"error": "Bu amal uchun ruxsatingiz yo'q"}), 403
            return fn(*args, **kwargs)

        return wrapper

    return decorator


def get_request_language(request) -> str:
    """Query param (?lang=ru), keyin Accept-Language, keyin standart 'uz'."""
    from flask import current_app

    lang = request.args.get("lang")
    supported = current_app.config["SUPPORTED_LANGUAGES"]
    if lang in supported:
        return lang
    return current_app.config["DEFAULT_LANGUAGE"]
