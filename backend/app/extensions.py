"""
Flask kengaytmalari shu yerda e'lon qilinadi va app/__init__.py da ilovaga bog'lanadi.
Bu circular import muammosining oldini oladi.
"""
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
cors = CORS()
