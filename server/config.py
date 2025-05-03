from flask import Flask
from flask_cors import CORS
from flask_restful import Api
from sqlalchemy import MetaData
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from flask_jwt_extended import JWTManager

# Initialize Flask application
app = Flask(__name__)

# Configure Flask application settings
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///app.db"  
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = (
    False  
)

app.config["JWT_SECRET_KEY"] = "super-secret"  # Secret key for JWT authentication
app.json.compact = False  

# Define SQLAlchemy metadata with naming conventions for database constraints
metadata = MetaData(
    naming_convention={
        "ix": "ix_%(column_0_label)s",  
        "uq": "uq_%(table_name)s_%(column_0_name)s",  
        "ck": "ck_%(table_name)s_%(constraint_name)s",  
        "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",  
        "pk": "pk_%(table_name)s",  
    }
)

# Initialize SQLAlchemy with custom metadata
db = SQLAlchemy(metadata=metadata)
db.init_app(app)  

# Initialize Flask-Migrate for database migrations
migrate = Migrate()
migrate.init_app(app, db)  

ma = Marshmallow()
ma.init_app(app)  


jwt = JWTManager()
jwt.init_app(app)  

# Initialize REST API
api = Api(app)  

# Initialize CORS to allow cross-origin requests
CORS(app)  # Enable CORS for all routes
