# Mini Marketplace

A full-stack web application where users can sign up, create item listings, organize them by category, and favorite items with optional notes.

---

##  Features

- User signup/login with JWT authentication
- Create, read, update, and delete item listings
- Filter listings by category
- View “My Categories” — shows only categories the user has listings in
- Favorite listings with optional notes
- Protected routes using Redux global auth state
- Marshmallow schema validation & nested serialization

---

##  Technologies Used

### Backend:
- Python 3.8+
- Flask
- Flask-RESTful
- SQLAlchemy + Flask-Migrate
- Flask-JWT-Extended
- Flask-Marshmallow + Marshmallow
- CORS

### Frontend:
- React
- Redux Toolkit
- React Router
- Vite
- Fetch API

---

##  Models and Relationships

- **User**: has many `ItemListings`, has many `Favorites`
- **Category**: has many `ItemListings`
- **ItemListing**: belongs to a `User` and a `Category`
- **User** has many `Categories` through `ItemListings` (many-to-many via model)
- **Favorite**: belongs to both `User` and `ItemListing`, includes `note`

---

##  Running the App Locally

### 1. Backend Setup (Flask API)

```bash
cd server/
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
flask db upgrade
python app.py

### 1. Frontend Setup
cd client
npm install
npm run dev

New Features
This project implements two new technologies not taught in the core curriculum:
-Redux Toolkit — for global authentication state
-Marshmallow — for backend schema validation and advanced serialization

Authentication
JWTs are stored in localStorage and accessed via Redux
Protected routes (like My Listings, My Categories, Dashboard) redirect unauthenticated users
Logout clears JWT and resets app state