"""
Payme va Click to'lov tizimlari integratsiyasi.

MUHIM: Payme va Click protokollari vaqti-vaqti bilan yangilanadi.
Ishga tushirishdan oldin quyidagi rasmiy hujjatlar bilan solishtirib chiqing:
  - Payme Merchant API: https://developer.help.paycom.uz
  - Click Merchant API: https://docs.click.uz
Bu yerdagi kod ikkala tizimning umumiy, keng tarqalgan oqimini
(checkout yaratish + webhook orqali tasdiqlash) to'g'ri tuzilishda
amalga oshiradi, lekin haqiqiy merchant kalitlari bilan sandboxda
sinovdan o'tkazish tavsiya etiladi.
"""
import base64
import hashlib
import time

from flask import Blueprint, request, jsonify, current_app

from app.extensions import db
from app.models import Order, PaymentProvider, PaymentStatus, OrderStatus

payments_bp = Blueprint("payments", __name__, url_prefix="/api/payments")


# ---------------------------------------------------------------------------
# PAYME
# ---------------------------------------------------------------------------

def _generate_payme_checkout_url(order: Order) -> str:
    """
    Payme checkout havolasini generatsiya qiladi.
    Summani tiyin (so'mning 1/100 qismi) da yuborish kerak.
    """
    merchant_id = current_app.config["PAYME_MERCHANT_ID"]
    amount_tiyin = int(float(order.total_amount) * 100)

    params = f"m={merchant_id};ac.order_id={order.id};a={amount_tiyin}"
    encoded = base64.b64encode(params.encode()).decode()

    base_url = (
        "https://checkout.test.paycom.uz"
        if current_app.config["PAYME_TEST_MODE"]
        else "https://checkout.paycom.uz"
    )
    return f"{base_url}/{encoded}"


PAYME_ERROR_TRANSACTION_NOT_FOUND = -31003
PAYME_ERROR_ORDER_NOT_FOUND = -31050
PAYME_ERROR_ORDER_ALREADY_PAID = -31051
PAYME_ERROR_INVALID_AMOUNT = -31001


def _check_payme_auth(req) -> bool:
    """Payme so'rovlarini Basic Auth (Paycom:SECRET_KEY) orqali tekshiradi."""
    auth_header = req.headers.get("Authorization", "")
    if not auth_header.startswith("Basic "):
        return False
    try:
        decoded = base64.b64decode(auth_header.split(" ", 1)[1]).decode()
        _, secret = decoded.split(":", 1)
    except Exception:  # noqa: BLE001
        return False
    return secret == current_app.config["PAYME_SECRET_KEY"]


@payments_bp.post("/payme/webhook")
def payme_webhook():
    """
    Payme JSON-RPC 2.0 webhookini qabul qiladi.
    Asosiy metodlar: CheckPerformTransaction, CreateTransaction,
    PerformTransaction, CancelTransaction, CheckTransaction.
    """
    if not _check_payme_auth(request):
        return jsonify({"error": {"code": -32504, "message": "Ruxsat etilmagan"}}), 200

    payload = request.get_json(silent=True) or {}
    method = payload.get("method")
    params = payload.get("params", {})
    request_id = payload.get("id")

    def rpc_result(result):
        return jsonify({"result": result, "id": request_id})

    def rpc_error(code, message):
        return jsonify({"error": {"code": code, "message": message}, "id": request_id})

    if method == "CheckPerformTransaction":
        order_id = params.get("account", {}).get("order_id")
        order = Order.query.get(order_id)
        if not order:
            return rpc_error(PAYME_ERROR_ORDER_NOT_FOUND, "Buyurtma topilmadi")
        if order.payment_status == PaymentStatus.PAID:
            return rpc_error(PAYME_ERROR_ORDER_ALREADY_PAID, "Buyurtma allaqachon to'langan")
        expected_amount = int(float(order.total_amount) * 100)
        if params.get("amount") != expected_amount:
            return rpc_error(PAYME_ERROR_INVALID_AMOUNT, "Summa mos kelmadi")
        return rpc_result({"allow": True})

    if method == "CreateTransaction":
        order_id = params.get("account", {}).get("order_id")
        order = Order.query.get(order_id)
        if not order:
            return rpc_error(PAYME_ERROR_ORDER_NOT_FOUND, "Buyurtma topilmadi")

        order.payment_transaction_id = params.get("id")
        order.payment_provider = PaymentProvider.PAYME
        db.session.commit()

        return rpc_result(
            {
                "create_time": int(time.time() * 1000),
                "transaction": order.id,
                "state": 1,
            }
        )

    if method == "PerformTransaction":
        transaction_id = params.get("id")
        order = Order.query.filter_by(payment_transaction_id=transaction_id).first()
        if not order:
            return rpc_error(PAYME_ERROR_TRANSACTION_NOT_FOUND, "Tranzaksiya topilmadi")

        order.payment_status = PaymentStatus.PAID
        order.status = OrderStatus.CONFIRMED
        db.session.commit()

        return rpc_result(
            {"transaction": order.id, "perform_time": int(time.time() * 1000), "state": 2}
        )

    if method == "CancelTransaction":
        transaction_id = params.get("id")
        order = Order.query.filter_by(payment_transaction_id=transaction_id).first()
        if not order:
            return rpc_error(PAYME_ERROR_TRANSACTION_NOT_FOUND, "Tranzaksiya topilmadi")

        order.payment_status = PaymentStatus.CANCELLED
        order.status = OrderStatus.CANCELLED
        db.session.commit()

        return rpc_result(
            {"transaction": order.id, "cancel_time": int(time.time() * 1000), "state": -1}
        )

    if method == "CheckTransaction":
        transaction_id = params.get("id")
        order = Order.query.filter_by(payment_transaction_id=transaction_id).first()
        if not order:
            return rpc_error(PAYME_ERROR_TRANSACTION_NOT_FOUND, "Tranzaksiya topilmadi")
        state = 2 if order.payment_status == PaymentStatus.PAID else 1
        return rpc_result({"transaction": order.id, "state": state})

    return rpc_error(-32601, "Metod topilmadi")


# ---------------------------------------------------------------------------
# CLICK
# ---------------------------------------------------------------------------

def _generate_click_checkout_url(order: Order) -> str:
    merchant_id = current_app.config["CLICK_MERCHANT_ID"]
    service_id = current_app.config["CLICK_SERVICE_ID"]
    amount = float(order.total_amount)
    return_url = current_app.config.get("CORS_ORIGINS", ["*"])[0]

    return (
        "https://my.click.uz/services/pay"
        f"?service_id={service_id}&merchant_id={merchant_id}"
        f"&amount={amount}&transaction_param={order.id}&return_url={return_url}"
    )


def _click_signature_valid(params: dict) -> bool:
    """Click 'sign_string' ni tekshiradi (MD5 xesh)."""
    secret_key = current_app.config["CLICK_SECRET_KEY"]
    if params.get("action") == "0":  # Prepare
        raw = (
            f"{params.get('click_trans_id')}{params.get('service_id')}{secret_key}"
            f"{params.get('merchant_trans_id')}{params.get('amount')}"
            f"{params.get('action')}{params.get('sign_time')}"
        )
    else:  # Complete
        raw = (
            f"{params.get('click_trans_id')}{params.get('service_id')}{secret_key}"
            f"{params.get('merchant_trans_id')}{params.get('merchant_prepare_id', '')}"
            f"{params.get('amount')}{params.get('action')}{params.get('sign_time')}"
        )
    expected = hashlib.md5(raw.encode()).hexdigest()
    return expected == params.get("sign_string")


@payments_bp.post("/click/prepare")
def click_prepare():
    params = request.form.to_dict()
    if not _click_signature_valid(params):
        return jsonify({"error": -1, "error_note": "Imzo mos kelmadi"})

    order = Order.query.get(params.get("merchant_trans_id"))
    if not order:
        return jsonify({"error": -5, "error_note": "Buyurtma topilmadi"})

    return jsonify(
        {
            "click_trans_id": params.get("click_trans_id"),
            "merchant_trans_id": order.id,
            "merchant_prepare_id": order.id,
            "error": 0,
            "error_note": "Success",
        }
    )


@payments_bp.post("/click/complete")
def click_complete():
    params = request.form.to_dict()
    if not _click_signature_valid(params):
        return jsonify({"error": -1, "error_note": "Imzo mos kelmadi"})

    order = Order.query.get(params.get("merchant_trans_id"))
    if not order:
        return jsonify({"error": -5, "error_note": "Buyurtma topilmadi"})

    if params.get("error") == "0":
        order.payment_status = PaymentStatus.PAID
        order.status = OrderStatus.CONFIRMED
        order.payment_provider = PaymentProvider.CLICK
        order.payment_transaction_id = params.get("click_trans_id")
    else:
        order.payment_status = PaymentStatus.FAILED

    db.session.commit()

    return jsonify(
        {
            "click_trans_id": params.get("click_trans_id"),
            "merchant_trans_id": order.id,
            "merchant_confirm_id": order.id,
            "error": 0,
            "error_note": "Success",
        }
    )


# ---------------------------------------------------------------------------
# Umumiy: xaridor uchun checkout havolasini olish
# ---------------------------------------------------------------------------


@payments_bp.post("/checkout-url/<order_id>")
def get_checkout_url(order_id):
    order = Order.query.get_or_404(order_id)
    provider = request.get_json(silent=True, force=True).get("provider") if request.data else None
    provider = provider or request.args.get("provider")

    if provider == PaymentProvider.PAYME.value:
        return jsonify({"checkout_url": _generate_payme_checkout_url(order)})
    if provider == PaymentProvider.CLICK.value:
        return jsonify({"checkout_url": _generate_click_checkout_url(order)})

    return jsonify({"error": "provider 'payme' yoki 'click' bo'lishi kerak"}), 400
