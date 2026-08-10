"""
Ilova konfiguratsiyasi.
Barcha maxfiy qiymatlar .env faylidan o'qiladi (.env.example ga qarang).
"""
import os
from datetime import timedelta


class Config:
    # --- Umumiy ---
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-key-almashtiring")

    # --- Ma'lumotlar bazasi ---
    # Railway/Render PostgreSQL "postgres://" beradi, SQLAlchemy 1.4+ "postgresql://" talab qiladi
    _db_url = os.environ.get("DATABASE_URL", "sqlite:///local.db")
    if _db_url.startswith("postgres://"):
        _db_url = _db_url.replace("postgres://", "postgresql://", 1)
    SQLALCHEMY_DATABASE_URI = _db_url
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # --- JWT ---
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "dev-jwt-secret-almashtiring")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)

    # --- Fayllar (rasm) ---
    UPLOAD_FOLDER = os.environ.get("UPLOAD_FOLDER", "uploads")
    MAX_CONTENT_LENGTH = 25 * 1024 * 1024  # 25 MB (Excel + rasmlar uchun)
    ALLOWED_IMAGE_EXT = {"png", "jpg", "jpeg", "webp"}
    ALLOWED_EXCEL_EXT = {"xlsx", "xls"}

    # --- Tillar ---
    SUPPORTED_LANGUAGES = ["uz", "ru", "en"]
    DEFAULT_LANGUAGE = "uz"

    # --- To'lov tizimlari (Payme / Click) ---
    PAYME_MERCHANT_ID = os.environ.get("PAYME_MERCHANT_ID", "")
    PAYME_SECRET_KEY = os.environ.get("PAYME_SECRET_KEY", "")
    PAYME_TEST_MODE = os.environ.get("PAYME_TEST_MODE", "true").lower() == "true"

    CLICK_MERCHANT_ID = os.environ.get("CLICK_MERCHANT_ID", "")
    CLICK_SERVICE_ID = os.environ.get("CLICK_SERVICE_ID", "")
    CLICK_SECRET_KEY = os.environ.get("CLICK_SECRET_KEY", "")

    # --- CORS ---
    CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "*").split(",")


class DevelopmentConfig(Config):
    DEBUG = True


class ProductionConfig(Config):
    DEBUG = False


config_by_name = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
}
