"""
Excel fayldan mahsulotlarni ommaviy import qilish.

Kutilayotgan ustunlar (TZ bo'lim 4.3 ga qarang):
    Mahsulot nomi | Kategoriya | Narx | O'lchov birligi | Miqdori (ombor) |
    Tavsif | Ishlab chiqaruvchi | Rasm havolasi | Xarid turi |
    Birja nomi | Lot raqami | Lot havolasi

Bir mahsulot bir nechta birjada bo'lishi mumkin - bunday holda o'sha
mahsulot uchun bir nechta qator yoziladi (Mahsulot nomi bir xil, faqat
Birja nomi/Lot ma'lumotlari farqlanadi). Import skripti bir xil nom +
kategoriya bo'yicha mahsulotni birlashtirib, har bir qatordagi lotni
qo'shib boradi.
"""
import re
import uuid

import pandas as pd

from app.extensions import db
from app.models import Category, Product, ProductImage, ExchangeLot, ExchangeName, PurchaseType

REQUIRED_COLUMNS = ["Mahsulot nomi", "Kategoriya", "Narx", "O'lchov birligi", "Xarid turi"]

EXCHANGE_NAME_MAP = {
    "xt-xarid": ExchangeName.XT_XARID,
    "xtxarid": ExchangeName.XT_XARID,
    "hayot birja": ExchangeName.XT_XARID,
    "uzex": ExchangeName.UZEX_XARID,
    "uzex xarid": ExchangeName.UZEX_XARID,
    "cooperation": ExchangeName.COOPERATION,
    "kooperatsiya": ExchangeName.COOPERATION,
}

PURCHASE_TYPE_MAP = {
    "naqd": PurchaseType.CASH,
    "birja": PurchaseType.EXCHANGE,
    "ikkalasi": PurchaseType.BOTH,
}


def slugify(text: str) -> str:
    text = text.strip().lower()
    text = re.sub(r"[^a-z0-9а-яёʻʼ\s-]", "", text, flags=re.UNICODE)
    text = re.sub(r"[\s_]+", "-", text)
    return f"{text[:60]}-{uuid.uuid4().hex[:6]}"


def _get_or_create_category(name: str) -> Category:
    name = name.strip()
    category = Category.query.filter_by(name_uz=name).first()
    if category:
        return category
    category = Category(name_uz=name, slug=slugify(name))
    db.session.add(category)
    db.session.flush()  # id olish uchun
    return category


def _parse_exchange_name(value: str):
    if not value:
        return None
    key = str(value).strip().lower()
    return EXCHANGE_NAME_MAP.get(key)


def import_products_from_excel(file_stream, admin_id: str):
    """
    Excel faylni o'qiydi va mahsulotlarni bazaga yozadi.

    Qaytaradi: dict {total_rows, success_rows, failed_rows, error_report}
    """
    df = pd.read_excel(file_stream)
    df.columns = [str(c).strip() for c in df.columns]

    missing = [c for c in REQUIRED_COLUMNS if c not in df.columns]
    if missing:
        raise ValueError(
            "Excel faylda quyidagi majburiy ustunlar topilmadi: " + ", ".join(missing)
        )

    total_rows = len(df)
    success_rows = 0
    error_report = []

    # Bitta "run" ichida bir xil nomdagi mahsulotlarni keshlab turamiz,
    # shunda bir nechta birja qatori bitta mahsulotga birlashadi.
    product_cache = {}

    for idx, row in df.iterrows():
        excel_row_number = idx + 2  # 1-qator sarlavha, Excelda ko'rinadigan raqam
        try:
            name = str(row["Mahsulot nomi"]).strip()
            category_name = str(row["Kategoriya"]).strip()
            price = float(row["Narx"])
            unit = str(row["O'lchov birligi"]).strip() or "dona"
            purchase_type_raw = str(row["Xarid turi"]).strip().lower()
            purchase_type = PURCHASE_TYPE_MAP.get(purchase_type_raw)

            if not name or not category_name:
                raise ValueError("Mahsulot nomi yoki Kategoriya bo'sh")
            if purchase_type is None:
                raise ValueError(
                    f"Xarid turi noto'g'ri: '{purchase_type_raw}' "
                    "(Naqd / Birja / Ikkalasi bo'lishi kerak)"
                )

            cache_key = (name, category_name)

            if cache_key in product_cache:
                product = product_cache[cache_key]
            else:
                category = _get_or_create_category(category_name)

                description = row.get("Tavsif")
                manufacturer = row.get("Ishlab chiqaruvchi")
                stock_quantity = row.get("Miqdori (ombor)") or row.get("Miqdori") or 0

                product = Product(
                    name_uz=name,
                    slug=slugify(name),
                    description_uz=None if pd.isna(description) else str(description),
                    category_id=category.id,
                    manufacturer=None if pd.isna(manufacturer) else str(manufacturer),
                    price=price,
                    unit=unit,
                    stock_quantity=int(stock_quantity) if not pd.isna(stock_quantity) else 0,
                    purchase_type=purchase_type,
                )
                db.session.add(product)
                db.session.flush()

                image_field = row.get("Rasm fayl nomi/havolasi") or row.get("Rasm havolasi")
                if image_field and not pd.isna(image_field):
                    urls = [u.strip() for u in str(image_field).split(",") if u.strip()]
                    for order, url in enumerate(urls):
                        db.session.add(
                            ProductImage(product_id=product.id, image_url=url, sort_order=order)
                        )

                product_cache[cache_key] = product

            # Birja lotini bog'lash (agar ko'rsatilgan bo'lsa)
            exchange_raw = row.get("Birja nomi")
            lot_number = row.get("Lot raqami/ID") or row.get("Lot raqami")
            lot_url = row.get("Lot havolasi")

            if exchange_raw and not pd.isna(exchange_raw):
                exchange_name = _parse_exchange_name(exchange_raw)
                if exchange_name is None:
                    raise ValueError(f"Noma'lum birja nomi: '{exchange_raw}'")
                if not lot_url or pd.isna(lot_url):
                    raise ValueError("Birja ko'rsatilgan, lekin 'Lot havolasi' bo'sh")

                db.session.add(
                    ExchangeLot(
                        product_id=product.id,
                        exchange_name=exchange_name,
                        lot_number=str(lot_number) if lot_number and not pd.isna(lot_number) else "",
                        lot_url=str(lot_url).strip(),
                    )
                )

            success_rows += 1

        except Exception as exc:  # noqa: BLE001 - har bir qator xatosini alohida qaytaramiz
            error_report.append({"row": excel_row_number, "error": str(exc)})

    if error_report:
        db.session.rollback()
        # Xatolik bo'lsa, hech narsa saqlanmaydi - admin faylni tuzatib qayta yuklashi kerak.
        # Agar qisman saqlash kerak bo'lsa, bu qatorni olib tashlab db.session.commit() qiling.
    else:
        db.session.commit()

    return {
        "total_rows": total_rows,
        "success_rows": success_rows if not error_report else 0,
        "failed_rows": len(error_report),
        "error_report": error_report,
    }
