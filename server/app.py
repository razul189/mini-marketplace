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

# --- Resource Classes ---


class SignupResource(Resource):
    """Handles user signup requests."""

    def post(self):
        """Create a new user account."""
        data = request.get_json() or {}
        if User.query.filter_by(username=data.get("username")).first():
            return {"msg": "Username exists"}, 400
        user = User(username=data["username"], email=data["email"])
        user.set_password(data["password"])
        db.session.add(user)
        db.session.commit()
        return user_schema.dump(user), 201


class LoginResource(Resource):
    """Handles user login requests."""

    def post(self):
        """Authenticate a user and issue a JWT token."""
        data = request.get_json() or {}
        user = User.query.filter_by(username=data.get("username")).first()
        if user and user.check_password(data.get("password")):
            token = create_access_token(
                identity=str(user.id),
                expires_delta=timedelta(hours=1),
            )
            return {"access_token": token}, 200
        return {"msg": "Bad credentials"}, 401


class MeResource(Resource):
    @jwt_required()
    def get(self):
        """Retrieve authenticated user's profile."""
        uid_str = get_jwt_identity()
        try:
            uid = int(uid_str)
        except (TypeError, ValueError):
            abort(400, description="Invalid user ID format")
        user = User.query.get_or_404(uid)
        return user_schema.dump(user), 200


class MyCategoriesResource(Resource):
    """Handles requests for authenticated user's categories."""

    @jwt_required()
    def get(self):
        """
        Retrieve only the current user's categories with their listings.
        Excludes categories with no listings after deletion.
        """
        uid_str = get_jwt_identity()
        try:
            uid = int(uid_str)
        except (TypeError, ValueError):
            abort(400, description="Invalid user ID format")
        user_categories = (
            Category.query.join(ItemListing)
            .filter(ItemListing.user_id == uid)
            .distinct()
            .all()
        )
        categories_with_listings = []
        for category in user_categories:
            user_listings = ItemListing.query.filter_by(
                user_id=uid, category_id=category.id
            ).all()
            if user_listings:  # Only include categories with listings
                category.listings = user_listings
                categories_with_listings.append(category)
        return cats_schema.dump(categories_with_listings), 200


class CategoryListResource(Resource):
    """Handles category listing and creation."""

    def get(self):
        """Retrieve all categories."""
        return cats_schema.dump(Category.query.all()), 200

    @jwt_required()
    def post(self):
        """Create a new category."""
        data = request.get_json() or {}
        try:
            cat = cat_schema.load(data, session=db.session)
        except Exception as e:
            return {"msg": str(e)}, 400
        db.session.add(cat)
        db.session.commit()
        return cat_schema.dump(cat), 201


class CategoryResource(Resource):
    """Handles requests for a specific category, returning authenticated user's listings."""

    @jwt_required()
    def get(self, id):
        """
        Retrieve the authenticated user's listings for a specific category by ID.
        Returns the category details with only the user's listings nested.
        """
        uid_str = get_jwt_identity()
        try:
            uid = int(uid_str)
        except (TypeError, ValueError):
            abort(400, description="Invalid user ID format")
        
        category = Category.query.get_or_404(id)
        
        user_listings = ItemListing.query.filter_by(
            user_id=uid, category_id=category.id
        ).all()
        
        category.listings = user_listings
        return cat_schema.dump(category), 200


class FavoriteListResource(Resource):
    """Handles favorite listing and creation."""

    @jwt_required()
    def get(self):
        """Retrieve authenticated user's favorites."""
        uid_str = get_jwt_identity()
        try:
            uid = int(uid_str)
        except (TypeError, ValueError):
            abort(400, description="Invalid user ID format")
        favs = Favorite.query.filter_by(user_id=uid).all()
        return favs_schema.dump(favs), 200

    @jwt_required()
    def post(self):
        """Create a new favorite with optional note."""
        uid_str = get_jwt_identity()
        try:
            uid = int(uid_str)
        except (TypeError, ValueError):
            abort(400, description="Invalid user ID format")
        data = request.get_json() or {}
        data["user_id"] = uid
        try:
            fav = fav_schema.load(data, session=db.session)
        except Exception as e:
            abort(400, str(e))
        db.session.add(fav)
        db.session.commit()
        return fav_schema.dump(fav), 201


class FavoriteResource(Resource):
    """Handles favorite updates and deletion."""

    @jwt_required()
    def put(self, id):
        """Update a favorite's note."""
        uid_str = get_jwt_identity()
        try:
            uid = int(uid_str)
        except (TypeError, ValueError):
            abort(400, description="Invalid user ID format")
        fav = Favorite.query.get_or_404(id)
        if fav.user_id != uid:
            abort(403)
        data = request.get_json() or {}
        try:
            fav = fav_schema.load(data, instance=fav, partial=True, session=db.session)
        except Exception as e:
            abort(400, str(e))
        db.session.commit()
        return fav_schema.dump(fav), 200

    @jwt_required()
    def delete(self, id):
        """Delete a favorite."""
        uid_str = get_jwt_identity()
        try:
            uid = int(uid_str)
        except (TypeError, ValueError):
            abort(400, description="Invalid user ID format")
        fav = Favorite.query.get_or_404(id)
        if fav.user_id != uid:
            abort(403)
        db.session.delete(fav)
        db.session.commit()
        return "", 204


class ListingListResource(Resource):
    """Handles item listing and creation."""

    def get(self):
        """Retrieve item listings, filterable by category."""
        args = request.args
        qs = ItemListing.query
        if args.get("category_id"):
            qs = qs.filter_by(category_id=args["category_id"])
        return listings_schema.dump(qs.all()), 200

    @jwt_required()
    def post(self):
        """Create a new item listing."""
        uid_str = get_jwt_identity()
        try:
            uid = int(uid_str)
        except (TypeError, ValueError):
            abort(400, description="Invalid user ID format")
        data = request.get_json() or {}
        data["user_id"] = uid
        try:
            listing = listing_schema.load(data, session=db.session)
        except Exception as e:
            abort(400, str(e))
        db.session.add(listing)
        db.session.commit()
        return listing_schema.dump(listing), 201


class ListingResource(Resource):
    """Handles specific item listing requests."""

    def get(self, id):
        """Retrieve an item listing by ID."""
        return listing_schema.dump(ItemListing.query.get_or_404(id)), 200

    @jwt_required()
    def put(self, id):
        """Update an item listing."""
        uid_str = get_jwt_identity()
        try:
            uid = int(uid_str)
        except (TypeError, ValueError):
            abort(400, description="Invalid user ID format")
        listing = ItemListing.query.get_or_404(id)
        if listing.user_id != uid:
            abort(403)
        try:
            listing = listing_schema.load(
                request.json, instance=listing, session=db.session
            )
        except Exception as e:
            abort(400, str(e))
        db.session.commit()
        return listing_schema.dump(listing), 200

    @jwt_required()
    def delete(self, id):
        """Delete an item listing, impacts 'My Categories' if last in category."""
        uid_str = get_jwt_identity()
        try:
            uid = int(uid_str)
        except (TypeError, ValueError):
            abort(400, description="Invalid user ID format")
        listing = ItemListing.query.get_or_404(id)
        if listing.user_id != uid:
            abort(403)
        db.session.delete(listing)
        db.session.commit()
        return "", 204


class MyListingsResource(Resource):
    """Handles authenticated user's listings."""

    @jwt_required()
    def get(self):
        """Retrieve authenticated user's listings, filterable by category."""
        uid_str = get_jwt_identity()
        try:
            uid = int(uid_str)
        except (TypeError, ValueError):
            abort(400, description="Invalid user ID format")
        args = request.args
        qs = ItemListing.query.filter_by(user_id=uid)
        if args.get("category_id"):
            qs = qs.filter_by(category_id=args["category_id"])
        return listings_schema.dump(qs.all()), 200
    

# --- Register API Resources ---

api.add_resource(SignupResource, "/api/signup")
api.add_resource(LoginResource, "/api/login")
api.add_resource(MeResource, "/api/me")
api.add_resource(MyCategoriesResource, "/api/me/categories")
api.add_resource(CategoryListResource, "/api/categories")
api.add_resource(CategoryResource, "/api/categories/<int:id>")
api.add_resource(FavoriteListResource, "/api/favorites")
api.add_resource(FavoriteResource, "/api/favorites/<int:id>")
api.add_resource(ListingListResource, "/api/listings")
api.add_resource(ListingResource, "/api/listings/<int:id>")
api.add_resource(MyListingsResource, "/api/me/listings")

# Set up the event listener within an application context
with app.app_context():

    @event.listens_for(db.engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()


if __name__ == "__main__":
    app.run(port=5000, debug=True)