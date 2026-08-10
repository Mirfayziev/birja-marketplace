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
    bazaga yozadi. Bir xil nomdagi kategoriya mavjud bo'lsa, qayta yaratilmaydi -
    buyruqni bir necha marta xavfsiz ishga tushirish mumkin.
        flask --app run.py seed-categories
    """

    def get_or_create(name, parent_id, sort_order):
        category = Category.query.filter_by(name_uz=name, parent_id=parent_id).first()
        if category:
            return category
        category = Category(
            name_uz=name,
            slug=slugify(name),
            parent_id=parent_id,
            sort_order=sort_order,
        )
        db.session.add(category)
        db.session.flush()
        return category

    created = 0
    for root_order, (root_name, groups) in enumerate(CATALOG.items()):
        root = get_or_create(root_name, None, root_order)
        created += 1
        for group_order, (group_name, items) in enumerate(groups.items()):
            group = get_or_create(group_name, root.id, group_order)
            created += 1
            for item_order, item_name in enumerate(items):
                get_or_create(item_name, group.id, item_order)
                created += 1

    db.session.commit()
    print(f"Kategoriyalar tayyor: {created} ta yozuv tekshirildi/yaratildi.")


if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)), debug=True)
