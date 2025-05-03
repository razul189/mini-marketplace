from sqlalchemy import event
from datetime import timedelta
from config import app, db, api
from flask import request, abort
from flask_restful import Resource
from marshmallow import fields, validate
from marshmallow_sqlalchemy import SQLAlchemyAutoSchema
from models import User, Favorite, Category, ItemListing
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required

# --- Schema Definitions ---


class UserSchema(SQLAlchemyAutoSchema):
    """
    Schema for serializing and deserializing User model instances.
    """

    class Meta:
        model = User
        load_instance = True
        include_relationships = True
        sqla_session = db.session
        dump_only = ("id", "created_at", "password_hash")

    id = fields.Integer(dump_only=True)
    password = fields.String(
        load_only=True,
        required=True,
        validate=validate.Length(min=6),
    )
    links = fields.Method("get_links")

    def get_links(self, obj):
        return {
            "self": "/api/me",
            "listings": "/api/me/listings",
            "categories": "/api/me/categories",
        }


class CategorySchema(SQLAlchemyAutoSchema):
    """
    Schema for serializing and deserializing Category model instances.
    Includes nested listings for 'My Categories' functionality.
    """

    class Meta:
        model = Category
        load_instance = True
        include_relationships = False
        sqla_session = db.session

    id = fields.Integer(dump_only=True)
    name = fields.String(required=True)
    listings = fields.Nested("ItemListingSchema", many=True, dump_only=True)
    links = fields.Method("get_links")

    def get_links(self, obj):
        return {
            "self": f"/api/categories/{obj.id}",
            "listings": f"/api/listings?category_id={obj.id}",
        }


class ItemListingSchema(SQLAlchemyAutoSchema):
    """
    Schema for serializing and deserializing ItemListing model instances.
    Includes nested category info for frontend display.
    """

    class Meta:
        model = ItemListing
        load_instance = True
        include_fk = True
        sqla_session = db.session
        dump_only = ("id", "created_at")

    id = fields.Integer(dump_only=True)
    title = fields.String(required=True)
    description = fields.String(required=True)
    price = fields.Float(allow_none=True)
    image_url = fields.String(allow_none=True)
    category_id = fields.Integer(required=True)
    user_id = fields.Integer(required=True)
    category = fields.Nested(
        "CategorySchema", only=("id", "name"), dump_only=True
    )  # Added for category info
    owner = fields.Nested("UserSchema")  # Added for category info
    links = fields.Method("get_links")

    def get_links(self, obj):
        return {
            "self": f"/api/listings/{obj.id}",
            "owner": f"/api/users/{obj.user_id}",
            "category": f"/api/categories/{obj.category_id}",
        }


class FavoriteSchema(SQLAlchemyAutoSchema):
    """
    Schema for serializing and deserializing Favorite model instances.
    Includes nested listing with category info.
    """

    class Meta:
        model = Favorite
        load_instance = True
        include_fk = True
        sqla_session = db.session
        dump_only = ("id", "created_at")

    id = fields.Integer(dump_only=True)
    user_id = fields.Integer(required=True)
    item_listing_id = fields.Integer(required=True)
    note = fields.String(allow_none=True)
    created_at = fields.DateTime(dump_only=True)
    listing = fields.Nested(
        ItemListingSchema, dump_only=True
    )  # Includes category via ItemListing
    links = fields.Method("get_links")

    def get_links(self, obj):
        return {
            "self": f"/api/favorites/{obj.id}",
            "listing": f"/api/listings/{obj.item_listing_id}",
        }
    

# --- Schema Instances ---

user_schema = UserSchema()
cat_schema = CategorySchema()
cats_schema = CategorySchema(many=True)
fav_schema = FavoriteSchema()
favs_schema = FavoriteSchema(many=True)
listing_schema = ItemListingSchema()
listings_schema = ItemListingSchema(many=True)