"""Mahsulotlar: ochiq katalog (qidiruv/filtr) + admin CRUD + rasm va birja lot boshqaruvi."""
from flask import Blueprint, request, jsonify

from app.extensions import db
from app.models import (
    Product,
    ProductImage,
    ExchangeLot,
    ExchangeName,
    PurchaseType,
    UserRole,
)
from app.utils.security import roles_required, get_request_language
from app.utils.excel_import import slugify

products_bp = Blueprint("products", __name__, url_prefix="/api/products")


@products_bp.get("")
def list_products():
    lang = get_request_language(request)

    query = Product.query.filter_by(is_active=True)

    category_id = request.args.get("category_id")
    if category_id:
        query = query.filter_by(category_id=category_id)

    search = request.args.get("q")
    if search:
        like = f"%{search}%"
        query = query.filter(
            (Product.name_uz.ilike(like))
            | (Product.name_ru.ilike(like))
            | (Product.name_en.ilike(like))
        )

    purchase_type = request.args.get("purchase_type")  # naqd / birja / ikkalasi
    if purchase_type in [p.value for p in PurchaseType]:
        query = query.filter_by(purchase_type=PurchaseType(purchase_type))

    min_price = request.args.get("min_price", type=float)
    if min_price is not None:
        query = query.filter(Product.price >= min_price)

    max_price = request.args.get("max_price", type=float)
    if max_price is not None:
        query = query.filter(Product.price <= max_price)

    page = request.args.get("page", default=1, type=int)
    per_page = min(request.args.get("per_page", default=20, type=int), 100)

    pagination = query.order_by(Product.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    return jsonify(
        {
            "items": [p.to_dict(lang) for p in pagination.items],
            "page": page,
            "per_page": per_page,
            "total": pagination.total,
            "total_pages": pagination.pages,
        }
    )


@products_bp.get("/<product_id>")
def get_product(product_id):
    lang = get_request_language(request)
    product = Product.query.get_or_404(product_id)
    return jsonify(product.to_dict(lang))


@products_bp.get("/slug/<slug>")
def get_product_by_slug(slug):
    lang = get_request_language(request)
    product = Product.query.filter_by(slug=slug).first_or_404()
    return jsonify(product.to_dict(lang))


# ---------------------------------------------------------------------------
# Admin: mahsulot CRUD
# ---------------------------------------------------------------------------


@products_bp.post("")
@roles_required(UserRole.ADMIN, UserRole.SUPERADMIN)
def create_product():
    data = request.get_json(silent=True) or {}
    name_uz = (data.get("name_uz") or "").strip()
    category_id = data.get("category_id")
    price = data.get("price")
    purchase_type = data.get("purchase_type", PurchaseType.CASH.value)

    if not name_uz or not category_id or price is None:
        return jsonify({"error": "name_uz, category_id va price majburiy"}), 400

    if purchase_type not in [p.value for p in PurchaseType]:
        return jsonify({"error": "purchase_type noto'g'ri"}), 400

    product = Product(
        name_uz=name_uz,
        name_ru=data.get("name_ru"),
        name_en=data.get("name_en"),
        slug=slugify(name_uz),
        description_uz=data.get("description_uz"),
        description_ru=data.get("description_ru"),
        description_en=data.get("description_en"),
        category_id=category_id,
        manufacturer=data.get("manufacturer"),
        price=price,
        unit=data.get("unit", "dona"),
        stock_quantity=data.get("stock_quantity", 0),
        purchase_type=PurchaseType(purchase_type),
    )
    db.session.add(product)
    db.session.commit()
    return jsonify(product.to_dict()), 201


@products_bp.put("/<product_id>")
@roles_required(UserRole.ADMIN, UserRole.SUPERADMIN)
def update_product(product_id):
    product = Product.query.get_or_404(product_id)
    data = request.get_json(silent=True) or {}

    editable_fields = [
        "name_uz", "name_ru", "name_en",
        "description_uz", "description_ru", "description_en",
        "category_id", "manufacturer", "price", "unit",
        "stock_quantity", "is_active",
    ]
    for field in editable_fields:
        if field in data:
            setattr(product, field, data[field])

    if "purchase_type" in data:
        if data["purchase_type"] not in [p.value for p in PurchaseType]:
            return jsonify({"error": "purchase_type noto'g'ri"}), 400
        product.purchase_type = PurchaseType(data["purchase_type"])

    db.session.commit()
    return jsonify(product.to_dict())


@products_bp.delete("/<product_id>")
@roles_required(UserRole.ADMIN, UserRole.SUPERADMIN)
def delete_product(product_id):
    product = Product.query.get_or_404(product_id)
    product.is_active = False
    db.session.commit()
    return jsonify({"message": "Mahsulot o'chirildi"})


# ---------------------------------------------------------------------------
# Admin: mahsulot rasmlari
# ---------------------------------------------------------------------------


@products_bp.post("/<product_id>/images")
@roles_required(UserRole.ADMIN, UserRole.SUPERADMIN)
def add_product_image(product_id):
    product = Product.query.get_or_404(product_id)
    data = request.get_json(silent=True) or {}
    image_url = data.get("image_url")
    if not image_url:
        return jsonify({"error": "image_url majburiy"}), 400

    image = ProductImage(
        product_id=product.id,
        image_url=image_url,
        sort_order=data.get("sort_order", len(product.images)),
    )
    db.session.add(image)
    db.session.commit()
    return jsonify({"images": [img.image_url for img in product.images]}), 201


@products_bp.delete("/<product_id>/images/<image_id>")
@roles_required(UserRole.ADMIN, UserRole.SUPERADMIN)
def delete_product_image(product_id, image_id):
    image = ProductImage.query.filter_by(id=image_id, product_id=product_id).first_or_404()
    db.session.delete(image)
    db.session.commit()
    return jsonify({"message": "Rasm o'chirildi"})


# ---------------------------------------------------------------------------
# Admin: birja lotlarini bog'lash / uzish
# ---------------------------------------------------------------------------


@products_bp.post("/<product_id>/exchange-lots")
@roles_required(UserRole.ADMIN, UserRole.SUPERADMIN)
def add_exchange_lot(product_id):
    product = Product.query.get_or_404(product_id)
    data = request.get_json(silent=True) or {}

    exchange_name = data.get("exchange_name")
    lot_url = data.get("lot_url")
    if exchange_name not in [e.value for e in ExchangeName] or not lot_url:
        return jsonify(
            {"error": "exchange_name (XT-Xarid/Uzex Xarid/Cooperation.uz) va lot_url majburiy"}
        ), 400

    lot = ExchangeLot(
        product_id=product.id,
        exchange_name=ExchangeName(exchange_name),
        lot_number=data.get("lot_number", ""),
        lot_url=lot_url,
    )
    db.session.add(lot)
    db.session.commit()
    return jsonify(lot.to_dict()), 201


@products_bp.put("/<product_id>/exchange-lots/<lot_id>")
@roles_required(UserRole.ADMIN, UserRole.SUPERADMIN)
def update_exchange_lot(product_id, lot_id):
    lot = ExchangeLot.query.filter_by(id=lot_id, product_id=product_id).first_or_404()
    data = request.get_json(silent=True) or {}

    if "exchange_name" in data:
        if data["exchange_name"] not in [e.value for e in ExchangeName]:
            return jsonify({"error": "exchange_name noto'g'ri"}), 400
        lot.exchange_name = ExchangeName(data["exchange_name"])
    for field in ["lot_number", "lot_url", "is_active"]:
        if field in data:
            setattr(lot, field, data[field])

    db.session.commit()
    return jsonify(lot.to_dict())


@products_bp.delete("/<product_id>/exchange-lots/<lot_id>")
@roles_required(UserRole.ADMIN, UserRole.SUPERADMIN)
def delete_exchange_lot(product_id, lot_id):
    lot = ExchangeLot.query.filter_by(id=lot_id, product_id=product_id).first_or_404()
    db.session.delete(lot)
    db.session.commit()
    return jsonify({"message": "Lot bog'lanishi o'chirildi"})
