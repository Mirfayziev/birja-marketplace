"""
Lokal ishga tushirish: python run.py
Production da (Railway/Render): gunicorn run:app
"""
import os

from app import create_app
from app.extensions import db
from app.models import Category, User, UserRole
from app.utils.excel_import import slugify
from app.utils.security import hash_password
from app.utils.seed_data import CATALOG

app = create_app()


@app.cli.command("seed-admin")
def seed_admin():
    """
    Birinchi superadminni yaratish uchun buyruq:
        flask --app run.py seed-admin
    ADMIN_PHONE va ADMIN_PASSWORD environment orqali beriladi (.env ga qarang).
    """
    phone = os.environ.get("ADMIN_PHONE", "+998900000000")
    password = os.environ.get("ADMIN_PASSWORD", "ChangeMe123!")

    if User.query.filter_by(phone=phone).first():
        print("Bu raqamdagi foydalanuvchi allaqachon mavjud.")
        return

    admin = User(
        full_name="Bosh administrator",
        phone=phone,
        password_hash=hash_password(password),
        role=UserRole.SUPERADMIN,
    )
    db.session.add(admin)
    db.session.commit()
    print(f"Superadmin yaratildi: {phone}")


@app.cli.command("seed-categories")
def seed_categories():
    """
    CATALOG (app/utils/seed_data.py) dagi 3 bosqichli kategoriya daraxtini
    (uz/ru/en nomlari bilan) bazaga yozadi. Nom (uz) + ota kategoriya bo'yicha
    mos kelsa qayta yaratilmaydi, lekin name_ru/name_en har doim yangilanadi -
    shu sababli buyruqni ilgari yaratilgan (faqat uz nomli) kategoriyalarga
    tarjima qo'shish uchun ham xavfsiz qayta ishga tushirish mumkin.
        flask --app run.py seed-categories
    """

    def upsert(node, parent_id, sort_order):
        category = Category.query.filter_by(name_uz=node["uz"], parent_id=parent_id).first()
        if category:
            category.name_ru = node["ru"]
            category.name_en = node["en"]
            category.sort_order = sort_order
        else:
            category = Category(
                name_uz=node["uz"],
                name_ru=node["ru"],
                name_en=node["en"],
                slug=slugify(node["uz"]),
                parent_id=parent_id,
                sort_order=sort_order,
            )
            db.session.add(category)
            db.session.flush()
        return category

    updated = 0
    for root_order, root in enumerate(CATALOG):
        root_row = upsert(root, None, root_order)
        updated += 1
        for group_order, group in enumerate(root.get("items", [])):
            group_row = upsert(group, root_row.id, group_order)
            updated += 1
            for item_order, item in enumerate(group.get("items", [])):
                upsert(item, group_row.id, item_order)
                updated += 1

    db.session.commit()
    print(f"Kategoriyalar tayyor: {updated} ta yozuv tekshirildi/yangilandi.")


if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)), debug=True)
