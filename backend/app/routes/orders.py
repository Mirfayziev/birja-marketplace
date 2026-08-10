"""
Buyurtmalar (faqat naqd/to'g'ridan-to'g'ri xarid yo'nalishi uchun).
Birja orqali xarid saytda buyurtma yaratmaydi - xaridor to'g'ridan-to'g'ri
tegishli birja lotiga yo'naltiriladi (products.py dagi exchange_lots ga qarang).
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt

from app.extensions import db
from app.models import Order, OrderItem, Product, OrderStatus, UserRole
from app.utils.security import roles_required, generate_order_number

orders_bp = Blueprint("orders", __name__, url_prefix="/api/orders")


@orders_bp.post("")
@jwt_required()
def create_order():
    user_id = get_jwt_identity()
    data = request.get_json(silent=True) or {}

    items_input = data.get("items") or []  # [{product_id, quantity}]
    contact_phone = (data.get("contact_phone") or "").strip()
    contact_name = (data.get("contact_name") or "").strip()

    if not items_input or not contact_phone or not contact_name:
        return jsonify({"error": "items, contact_phone va contact_name majburiy"}), 400

    order = Order(
        order_number=generate_order_number(),
        user_id=user_id,
        contact_phone=contact_phone,
        contact_name=contact_name,
        delivery_region=data.get("delivery_region"),
        delivery_address=data.get("delivery_address"),
        comment=data.get("comment"),
    )

    total = 0
    for item in items_input:
        product = Product.query.get(item.get("product_id"))
        quantity = int(item.get("quantity", 1))
        if not product or not product.is_active:
            return jsonify({"error": f"Mahsulot topilmadi: {item.get('product_id')}"}), 400
        if quantity < 1:
            return jsonify({"error": "quantity kamida 1 bo'lishi kerak"}), 400
        if product.stock_quantity is not None and product.stock_quantity < quantity:
            return jsonify({"error": f"'{product.name_uz}' omborda yetarli emas"}), 400

        order_item = OrderItem(
            product_id=product.id,
            product_name_snapshot=product.name_uz,
            unit_price_snapshot=product.price,
            quantity=quantity,
        )
        order.items.append(order_item)
        total += float(product.price) * quantity
        product.stock_quantity = (product.stock_quantity or 0) - quantity

    order.total_amount = total

    db.session.add(order)
    db.session.commit()

    return jsonify(order.to_dict()), 201


@orders_bp.get("")
@jwt_required()
def list_my_orders():
    user_id = get_jwt_identity()
    orders = (
        Order.query.filter_by(user_id=user_id).order_by(Order.created_at.desc()).all()
    )
    return jsonify([o.to_dict() for o in orders])


@orders_bp.get("/<order_id>")
@jwt_required()
def get_order(order_id):
    user_id = get_jwt_identity()
    claims = get_jwt()
    order = Order.query.get_or_404(order_id)

    is_owner = order.user_id == user_id
    is_staff = claims.get("role") in [UserRole.ADMIN.value, UserRole.SUPERADMIN.value]
    if not is_owner and not is_staff:
        return jsonify({"error": "Ruxsat yo'q"}), 403

    return jsonify(order.to_dict())


# ---------------------------------------------------------------------------
# Admin: barcha buyurtmalar va holat o'zgartirish
# ---------------------------------------------------------------------------


@orders_bp.get("/admin/all")
@roles_required(UserRole.ADMIN, UserRole.SUPERADMIN)
def list_all_orders():
    status = request.args.get("status")
    query = Order.query
    if status:
        query = query.filter_by(status=OrderStatus(status))
    orders = query.order_by(Order.created_at.desc()).all()
    return jsonify([o.to_dict() for o in orders])


@orders_bp.put("/admin/<order_id>/status")
@roles_required(UserRole.ADMIN, UserRole.SUPERADMIN)
def update_order_status(order_id):
    order = Order.query.get_or_404(order_id)
    data = request.get_json(silent=True) or {}
    new_status = data.get("status")

    if new_status not in [s.value for s in OrderStatus]:
        return jsonify({"error": "status noto'g'ri"}), 400

    order.status = OrderStatus(new_status)
    db.session.commit()
    return jsonify(order.to_dict())
