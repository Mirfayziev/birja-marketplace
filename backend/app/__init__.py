"""Flask ilova factory."""
import os

from flask import Flask, jsonify

from app.config import config_by_name
from app.extensions import db, migrate, jwt, cors


def create_app(config_name=None):
    config_name = config_name or os.environ.get("FLASK_ENV", "development")

    app = Flask(__name__)
    app.config.from_object(config_by_name[config_name])

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}})

    # Modellarni import qilish (migratsiya ularni ko'rishi uchun)
    from app import models  # noqa: F401

    # Blueprintlarni ro'yxatdan o'tkazish
    from app.routes.auth import auth_bp
    from app.routes.categories import categories_bp
    from app.routes.products import products_bp
    from app.routes.orders import orders_bp
    from app.routes.admin import admin_bp
    from app.routes.payments import payments_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(categories_bp)
    app.register_blueprint(products_bp)
    app.register_blueprint(orders_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(payments_bp)

    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok", "service": "birja-marketplace-backend"})

    @app.errorhandler(404)
    def not_found(_e):
        return jsonify({"error": "Sahifa/manzil topilmadi"}), 404

    @app.errorhandler(500)
    def server_error(_e):
        return jsonify({"error": "Serverda kutilmagan xatolik yuz berdi"}), 500

    return app
