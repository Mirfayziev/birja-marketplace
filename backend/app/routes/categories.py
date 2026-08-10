"""Kategoriyalar: ochiq ro'yxat + admin uchun CRUD."""
from flask import Blueprint, request, jsonify

from app.extensions import db
from app.models import Category, UserRole
from app.utils.security import roles_required, get_request_language
from app.utils.excel_import import slugify

categories_bp = Blueprint("categories", __name__, url_prefix="/api/categories")


@categories_bp.get("")
def list_categories():
    lang = get_request_language(request)
    parent_id = request.args.get("parent_id")

    query = Category.query.filter_by(is_active=True)
    if parent_id == "root":
        query = query.filter(Category.parent_id.is_(None))
    elif parent_id:
        query = query.filter_by(parent_id=parent_id)

    categories = query.order_by(Category.sort_order.asc()).all()
    return jsonify([c.to_dict(lang) for c in categories])


@categories_bp.get("/<category_id>")
def get_category(category_id):
    lang = get_request_language(request)
    category = Category.query.get_or_404(category_id)
    return jsonify(category.to_dict(lang))


@categories_bp.post("")
@roles_required(UserRole.ADMIN, UserRole.SUPERADMIN)
def create_category():
    data = request.get_json(silent=True) or {}
    name_uz = (data.get("name_uz") or "").strip()
    if not name_uz:
        return jsonify({"error": "name_uz majburiy"}), 400

    category = Category(
        name_uz=name_uz,
        name_ru=data.get("name_ru"),
        name_en=data.get("name_en"),
        slug=slugify(name_uz),
        parent_id=data.get("parent_id"),
        sort_order=data.get("sort_order", 0),
    )
    db.session.add(category)
    db.session.commit()
    return jsonify(category.to_dict()), 201


@categories_bp.put("/<category_id>")
@roles_required(UserRole.ADMIN, UserRole.SUPERADMIN)
def update_category(category_id):
    category = Category.query.get_or_404(category_id)
    data = request.get_json(silent=True) or {}

    for field in ["name_uz", "name_ru", "name_en", "parent_id", "sort_order", "is_active"]:
        if field in data:
            setattr(category, field, data[field])

    db.session.commit()
    return jsonify(category.to_dict())


@categories_bp.delete("/<category_id>")
@roles_required(UserRole.ADMIN, UserRole.SUPERADMIN)
def delete_category(category_id):
    category = Category.query.get_or_404(category_id)
    category.is_active = False  # yumshoq o'chirish - mahsulotlar bilan bog'liqlik saqlanadi
    db.session.commit()
    return jsonify({"message": "Kategoriya o'chirildi"})
