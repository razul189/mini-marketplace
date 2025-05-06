from datetime import datetime, timezone
from werkzeug.security import generate_password_hash, check_password_hash
from config import db

# --- Model Definitions ---

class User(db.Model):
    """
    User model representing a registered user in the application.

    Stores user authentication details and relationships to their listings and favorites.
    Provides a derived relationship to categories through item listings.
    """

    __tablename__ = "users"

    # Primary key with auto-incrementing integer
    id = db.Column(db.Integer, primary_key=True)
    # Unique username, required
    username = db.Column(db.String(64), unique=True, nullable=False)
    # Unique email address, required
    email = db.Column(db.String(120), unique=True, nullable=False)
    # Hashed password for secure storage
    password_hash = db.Column(db.String(128), nullable=False)
    # Timestamp of user creation
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    # Relationship to ItemListing objects owned by the user
    listings = db.relationship(
        "ItemListing", backref="owner", lazy="dynamic", cascade="all, delete-orphan"
    )
    # Relationship to Favorite objects
    favorite_items = db.relationship(
        "Favorite", backref="user", lazy="dynamic", cascade="all, delete-orphan"
    )

    # Derived relationship to categories through listings
    @property
    def categories(self):
        """
        Get distinct categories associated with the user's listings.

        Returns:
            list: List of Category objects the user has listings in.
        """
        return (
            Category.query.join(ItemListing)
            .filter(ItemListing.user_id == self.id)
            .distinct()
        )

    def set_password(self, password):
       
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
       
        return check_password_hash(self.password_hash, password)

class Category(db.Model):
    """
    Category model representing a category for organizing item listings.

    Stores category name and relationships to associated listings.
    Provides a derived relationship to users through item listings.
    """

    __tablename__ = "categories"

    # Primary key with auto-incrementing integer
    id = db.Column(db.Integer, primary_key=True)
    # Unique category name, required
    name = db.Column(db.String(64), unique=True, nullable=False)
    # Relationship to ItemListing objects in this category
    listings = db.relationship("ItemListing", backref="category", lazy="dynamic")

    # Derived relationship to users through listings
    @property
    def users(self):

        return (
            User.query.join(ItemListing)
            .filter(ItemListing.category_id == self.id)
            .distinct()
        )

class ItemListing(db.Model):
    """
    ItemListing model representing an item listing created by a user.

    Stores details about the item, its owner, and category.
    Acts as the intermediary for the many-to-many relationship between User and Category.
    """

    __tablename__ = "item_listings"

    # Primary key with auto-incrementing integer
    id = db.Column(db.Integer, primary_key=True)
    # Item title, required
    title = db.Column(db.String(140), nullable=False)
    # Detailed description, required
    description = db.Column(db.Text, nullable=False)
    # Price of the item, optional
    price = db.Column(db.Float)
    # URL for item image, optional
    image_url = db.Column(db.String(200))
    # Timestamp of listing creation
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    # Foreign key to the owning user
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    # Foreign key to the category
    category_id = db.Column(
        db.Integer,
        db.ForeignKey("categories.id", ondelete="SET NULL"),
        nullable=True,
    )
    # Relationship to Favorite objects
    favorited_by = db.relationship(
        "Favorite",
        backref="listing",
        lazy="dynamic",
        passive_deletes=True,
    )

class Favorite(db.Model):
    """
    Favorite model representing a user's favorited item listing.

    Stores the relationship between a user and an item listing with an optional note.
    Replaces the previous association table with a full model to include additional attributes.
    """

    __tablename__ = "favorites"

    # Primary key with auto-incrementing integer
    id = db.Column(db.Integer, primary_key=True)
    # Foreign key to the user
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    # Foreign key to the item listing
    item_listing_id = db.Column(
        db.Integer,
        db.ForeignKey("item_listings.id", ondelete="CASCADE"),
        nullable=False,
    )
    # Optional note about the favorite, fully implemented for functionality
    note = db.Column(db.Text)
    # Timestamp of favorite creation
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))