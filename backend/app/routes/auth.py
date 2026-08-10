"""Ro'yxatdan o'tish, kirish va joriy foydalanuvchi ma'lumotlari."""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

from app.extensions import db
from app.models import User, UserRole
from app.utils.security import hash_password, verify_password

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.post("/register")
def register():
    data = request.get_json(silent=True) or {}
    full_name = (data.get("full_name") or "").strip()
    phone = (data.get("phone") or "").strip() or None
    email = (data.get("email") or "").strip() or None
    password = data.get("password") or ""

    if not full_name or not password or (not phone and not email):
        return jsonify({"error": "full_name, password va (phone yoki email) majburiy"}), 400

    if phone and User.query.filter_by(phone=phone).first():
        return jsonify({"error": "Bu telefon raqami bilan foydalanuvchi mavjud"}), 409
    if email and User.query.filter_by(email=email).first():
        return jsonify({"error": "Bu email bilan foydalanuvchi mavjud"}), 409

    user = User(
        full_name=full_name,
        phone=phone,
        email=email,
        password_hash=hash_password(password),
        role=UserRole.CUSTOMER,
        preferred_language=data.get("preferred_language", "uz"),
    )
    db.session.add(user)
    db.session.commit()

    token = create_access_token(identity=user.id, additional_claims={"role": user.role.value})
    return jsonify({"user": user.to_dict(), "access_token": token}), 201


@auth_bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    identifier = (data.get("phone") or data.get("email") or "").strip()
    password = data.get("password") or ""

    if not identifier or not password:
        return jsonify({"error": "Login va parol majburiy"}), 400

    user = User.query.filter(
        (User.phone == identifier) | (User.email == identifier)
    ).first()

    if not user or not verify_password(password, user.password_hash):
        return jsonify({"error": "Login yoki parol noto'g'ri"}), 401

    if not user.is_active:
        return jsonify({"error": "Hisobingiz bloklangan"}), 403

    token = create_access_token(identity=user.id, additional_claims={"role": user.role.value})
    return jsonify({"user": user.to_dict(), "access_token": token})


@auth_bp.get("/me")
@jwt_required()
def me():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "Foydalanuvchi topilmadi"}), 404
    return jsonify(user.to_dict())
