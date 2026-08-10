"""Admin panel uchun Excel import va umumiy statistika."""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity

from app.extensions import db
from app.models import (
    Product,
    Order,
    OrderStatus,
    ExcelImportLog,
    ExchangeLot,
    UserRole,
)
from app.utils.security import roles_required
from app.utils.excel_import import import_products_from_excel

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")


@admin_bp.post("/products/import-excel")
@roles_required(UserRole.ADMIN, UserRole.SUPERADMIN)
def import_excel():
    if "file" not in request.files:
        return jsonify({"error": "'file' maydonida Excel fayl yuborilishi kerak"}), 400

    file = request.files["file"]
    if not file.filename.lower().endswith((".xlsx", ".xls")):
        return jsonify({"error": "Faqat .xlsx yoki .xls fayllar qabul qilinadi"}), 400

    admin_id = get_jwt_identity()

    try:
        result = import_products_from_excel(file, admin_id)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    except Exception as exc:  # noqa: BLE001
        return jsonify({"error": f"Faylni o'qishda xatolik: {exc}"}), 400

    log = ExcelImportLog(
        admin_id=admin_id,
        file_name=file.filename,
        total_rows=result["total_rows"],
        success_rows=result["success_rows"],
        failed_rows=result["failed_rows"],
        error_report=result["error_report"] or None,
    )
    db.session.add(log)
    db.session.commit()

    status_code = 200 if result["failed_rows"] == 0 else 422
    return jsonify(log.to_dict()), status_code


@admin_bp.get("/products/import-logs")
@roles_required(UserRole.ADMIN, UserRole.SUPERADMIN)
def import_logs():
    logs = ExcelImportLog.query.order_by(ExcelImportLog.created_at.desc()).limit(50).all()
    return jsonify([log.to_dict() for log in logs])


@admin_bp.get("/dashboard")
@roles_required(UserRole.ADMIN, UserRole.SUPERADMIN)
def dashboard():
    total_products = Product.query.filter_by(is_active=True).count()
    total_orders = Order.query.count()
    new_orders = Order.query.filter_by(status=OrderStatus.NEW).count()
    total_lots = ExchangeLot.query.filter_by(is_active=True).count()

    paid_orders = Order.query.filter(
        Order.status.in_([OrderStatus.CONFIRMED, OrderStatus.DELIVERED, OrderStatus.DELIVERING])
    ).all()
    total_revenue = sum(float(o.total_amount) for o in paid_orders)

    return jsonify(
        {
            "total_products": total_products,
            "total_orders": total_orders,
            "new_orders": new_orders,
            "total_exchange_lots": total_lots,
            "total_revenue": total_revenue,
        }
    )
