"""
SQLAlchemy modellari.

Ko'p tilli maydonlar (nom, tavsif) uch tilda alohida ustun sifatida saqlanadi:
_uz / _ru / _en. Bu eng oddiy va tez yechim - alohida tarjima jadvali
kerak bo'lganda kelajakda oson ko'chirish mumkin.
"""
import enum
import uuid
from datetime import datetime

from app.extensions import db


def gen_uuid():
    return str(uuid.uuid4())


class UserRole(str, enum.Enum):
    CUSTOMER = "customer"
    ADMIN = "admin"
    SUPERADMIN = "superadmin"


class PurchaseType(str, enum.Enum):
    CASH = "naqd"
    EXCHANGE = "birja"
    BOTH = "ikkalasi"


class OrderStatus(str, enum.Enum):
    NEW = "yangi"
    CONFIRMED = "tasdiqlangan"
    PROCESSING = "jarayonda"
    DELIVERING = "yetkazilmoqda"
    DELIVERED = "yetkazilgan"
    CANCELLED = "bekor_qilingan"


class PaymentProvider(str, enum.Enum):
    PAYME = "payme"
    CLICK = "click"
    CASH_ON_DELIVERY = "naqd_yetkazishda"


class PaymentStatus(str, enum.Enum):
    PENDING = "kutilmoqda"
    PAID = "tolangan"
    FAILED = "muvaffaqiyatsiz"
    CANCELLED = "bekor_qilingan"


class TimestampMixin:
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )


class User(db.Model, TimestampMixin):
    __tablename__ = "users"

    id = db.Column(db.String(36), primary_key=True, default=gen_uuid)
    full_name = db.Column(db.String(150), nullable=False)
    phone = db.Column(db.String(20), unique=True, nullable=True, index=True)
    email = db.Column(db.String(150), unique=True, nullable=True, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.Enum(UserRole), default=UserRole.CUSTOMER, nullable=False)
    preferred_language = db.Column(db.String(5), default="uz")
    is_active = db.Column(db.Boolean, default=True)

    orders = db.relationship("Order", back_populates="user", lazy="dynamic")

    def to_dict(self):
        return {
            "id": self.id,
            "full_name": self.full_name,
            "phone": self.phone,
            "email": self.email,
            "role": self.role.value,
            "preferred_language": self.preferred_language,
        }


class Category(db.Model, TimestampMixin):
    __tablename__ = "categories"

    id = db.Column(db.String(36), primary_key=True, default=gen_uuid)
    name_uz = db.Column(db.String(150), nullable=False)
    name_ru = db.Column(db.String(150), nullable=True)
    name_en = db.Column(db.String(150), nullable=True)
    slug = db.Column(db.String(170), unique=True, nullable=False, index=True)
    parent_id = db.Column(db.String(36), db.ForeignKey("categories.id"), nullable=True)
    sort_order = db.Column(db.Integer, default=0)
    is_active = db.Column(db.Boolean, default=True)

    children = db.relationship(
        "Category", backref=db.backref("parent", remote_side=[id]), lazy="dynamic"
    )
    products = db.relationship("Product", back_populates="category", lazy="dynamic")

    def name(self, lang="uz"):
        return getattr(self, f"name_{lang}", None) or self.name_uz

    def to_dict(self, lang="uz"):
        return {
            "id": self.id,
            "name": self.name(lang),
            "slug": self.slug,
            "parent_id": self.parent_id,
            "sort_order": self.sort_order,
        }


class Product(db.Model, TimestampMixin):
    __tablename__ = "products"

    id = db.Column(db.String(36), primary_key=True, default=gen_uuid)
    name_uz = db.Column(db.String(255), nullable=False)
    name_ru = db.Column(db.String(255), nullable=True)
    name_en = db.Column(db.String(255), nullable=True)
    slug = db.Column(db.String(280), unique=True, nullable=False, index=True)

    description_uz = db.Column(db.Text, nullable=True)
    description_ru = db.Column(db.Text, nullable=True)
    description_en = db.Column(db.Text, nullable=True)

    category_id = db.Column(db.String(36), db.ForeignKey("categories.id"), nullable=False)
    manufacturer = db.Column(db.String(255), nullable=True)

    price = db.Column(db.Numeric(14, 2), nullable=False)
    unit = db.Column(db.String(30), nullable=False, default="dona")  # dona, kg, m2 va h.k.
    stock_quantity = db.Column(db.Integer, default=0)

    purchase_type = db.Column(
        db.Enum(PurchaseType), default=PurchaseType.CASH, nullable=False
    )
    is_active = db.Column(db.Boolean, default=True)

    category = db.relationship("Category", back_populates="products")
    images = db.relationship(
        "ProductImage",
        back_populates="product",
        cascade="all, delete-orphan",
        order_by="ProductImage.sort_order",
    )
    exchange_lots = db.relationship(
        "ExchangeLot", back_populates="product", cascade="all, delete-orphan"
    )

    def name(self, lang="uz"):
        return getattr(self, f"name_{lang}", None) or self.name_uz

    def description(self, lang="uz"):
        return getattr(self, f"description_{lang}", None) or self.description_uz

    def to_dict(self, lang="uz", include_lots=True):
        data = {
            "id": self.id,
            "name": self.name(lang),
            "slug": self.slug,
            "description": self.description(lang),
            "category_id": self.category_id,
            "manufacturer": self.manufacturer,
            "price": float(self.price) if self.price is not None else None,
            "unit": self.unit,
            "stock_quantity": self.stock_quantity,
            "purchase_type": self.purchase_type.value,
            "images": [img.image_url for img in self.images],
            "image_ids": [img.id for img in self.images],
        }
        if include_lots:
            data["exchange_lots"] = [lot.to_dict() for lot in self.exchange_lots]
        return data


class ProductImage(db.Model):
    __tablename__ = "product_images"

    id = db.Column(db.String(36), primary_key=True, default=gen_uuid)
    product_id = db.Column(db.String(36), db.ForeignKey("products.id"), nullable=False)
    image_url = db.Column(db.String(500), nullable=False)
    sort_order = db.Column(db.Integer, default=0)

    product = db.relationship("Product", back_populates="images")


class ExchangeName(str, enum.Enum):
    XT_XARID = "XT-Xarid"
    UZEX_XARID = "Uzex Xarid"
    COOPERATION = "Cooperation.uz"


class ExchangeLot(db.Model, TimestampMixin):
    """
    Mahsulotni tegishli birjadagi lot bilan bog'lovchi jadval.
    Hozircha faqat havola (link) orqali ishlaydi - rasmiy API bo'lmagani uchun.
    Kelajakda API integratsiyasi qo'shilsa, shu jadvalga `external_status`,
    `synced_at` kabi ustunlar qo'shish kifoya qiladi.
    """

    __tablename__ = "exchange_lots"

    id = db.Column(db.String(36), primary_key=True, default=gen_uuid)
    product_id = db.Column(db.String(36), db.ForeignKey("products.id"), nullable=False)
    exchange_name = db.Column(db.Enum(ExchangeName), nullable=False)
    lot_number = db.Column(db.String(100), nullable=False)
    lot_url = db.Column(db.String(500), nullable=False)
    is_active = db.Column(db.Boolean, default=True)

    product = db.relationship("Product", back_populates="exchange_lots")

    def to_dict(self):
        return {
            "id": self.id,
            "exchange_name": self.exchange_name.value,
            "lot_number": self.lot_number,
            "lot_url": self.lot_url,
            "is_active": self.is_active,
        }


class Order(db.Model, TimestampMixin):
    __tablename__ = "orders"

    id = db.Column(db.String(36), primary_key=True, default=gen_uuid)
    order_number = db.Column(db.String(20), unique=True, nullable=False)
    user_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False)

    status = db.Column(db.Enum(OrderStatus), default=OrderStatus.NEW, nullable=False)
    total_amount = db.Column(db.Numeric(14, 2), nullable=False, default=0)

    # Yetkazib berish ma'lumotlari (sayt ichida rejalashtiriladi)
    delivery_region = db.Column(db.String(100), nullable=True)
    delivery_address = db.Column(db.String(500), nullable=True)
    contact_phone = db.Column(db.String(20), nullable=False)
    contact_name = db.Column(db.String(150), nullable=False)
    comment = db.Column(db.String(500), nullable=True)

    payment_provider = db.Column(db.Enum(PaymentProvider), nullable=True)
    payment_status = db.Column(
        db.Enum(PaymentStatus), default=PaymentStatus.PENDING, nullable=False
    )
    payment_transaction_id = db.Column(db.String(100), nullable=True)

    user = db.relationship("User", back_populates="orders")
    items = db.relationship(
        "OrderItem", back_populates="order", cascade="all, delete-orphan"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "order_number": self.order_number,
            "status": self.status.value,
            "total_amount": float(self.total_amount),
            "delivery_region": self.delivery_region,
            "delivery_address": self.delivery_address,
            "contact_phone": self.contact_phone,
            "contact_name": self.contact_name,
            "comment": self.comment,
            "payment_provider": self.payment_provider.value if self.payment_provider else None,
            "payment_status": self.payment_status.value,
            "created_at": self.created_at.isoformat(),
            "items": [item.to_dict() for item in self.items],
        }


class OrderItem(db.Model):
    __tablename__ = "order_items"

    id = db.Column(db.String(36), primary_key=True, default=gen_uuid)
    order_id = db.Column(db.String(36), db.ForeignKey("orders.id"), nullable=False)
    product_id = db.Column(db.String(36), db.ForeignKey("products.id"), nullable=False)

    product_name_snapshot = db.Column(db.String(255), nullable=False)
    unit_price_snapshot = db.Column(db.Numeric(14, 2), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=1)

    order = db.relationship("Order", back_populates="items")
    product = db.relationship("Product")

    def to_dict(self):
        return {
            "id": self.id,
            "product_id": self.product_id,
            "product_name": self.product_name_snapshot,
            "unit_price": float(self.unit_price_snapshot),
            "quantity": self.quantity,
            "subtotal": float(self.unit_price_snapshot) * self.quantity,
        }


class ExcelImportLog(db.Model, TimestampMixin):
    """Har bir Excel import urinishining tarixi va natijasi."""

    __tablename__ = "excel_import_logs"

    id = db.Column(db.String(36), primary_key=True, default=gen_uuid)
    admin_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False)
    file_name = db.Column(db.String(255), nullable=False)
    total_rows = db.Column(db.Integer, default=0)
    success_rows = db.Column(db.Integer, default=0)
    failed_rows = db.Column(db.Integer, default=0)
    error_report = db.Column(db.JSON, nullable=True)  # [{row: 5, error: "..."}]

    def to_dict(self):
        return {
            "id": self.id,
            "file_name": self.file_name,
            "total_rows": self.total_rows,
            "success_rows": self.success_rows,
            "failed_rows": self.failed_rows,
            "error_report": self.error_report,
            "created_at": self.created_at.isoformat(),
        }
