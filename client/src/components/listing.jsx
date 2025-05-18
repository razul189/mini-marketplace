import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import Navbar from "./navbar";
import { toggleFavorite } from "../store/authSlice";

export default function Listing() {
  const { id } = useParams();
  console.log("id", id);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const cachedUser = useSelector((state) => state.auth.user);
  const cachedCategories = useSelector((state) => state.categories.categories); // All Categories from Redux
  const listings = useSelector((state) => state.categories.listings); // All Listings
  const listing = listings.find((listing) => listing.id === parseInt(id)); // Single Listing
  const cachedMyFavorites = useSelector((state) => state.auth.myFavorites);
  const favorite = cachedMyFavorites.find(
    (favorite) => favorite.item_listing_id === parseInt(id)
  );
  // Redux state
  //const listing = useSelector((state) => state.listings.byId[id]);
  // const cachedFavorites = useSelector((state) => state.favorites.byId);
  console.log("cachedMyFavorites", cachedMyFavorites);

  const [isFavorited, setIsFavorited] = useState(false);
  const [note, setNote] = useState("");
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  console.log("isFavorited", isFavorited);

  useEffect(() => {
    if (cachedUser) {
      setIsFavorited(!!favorite);
      setNote(favorite?.note || "");
    }
  }, [cachedUser, id, token]);

  const handleToggleFavorite = async () => {
    if (!token) {
      setError("Please log in to favorite this listing");
      return;
    }

    setIsFavoriteLoading(true);
    try {
      await dispatch(toggleFavorite({ id, note, token, isFavorited }));
      setIsFavorited(!isFavorited);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  // Loading and error states
  if (!listing) {
    return (
      <div
        style={{
          minWidth: "100%",
          backgroundColor: "#fff",
          margin: 0,
          padding: "1rem",
        }}
      >
        <Navbar />
        <h1>Loading listing...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          minWidth: "100%",
          backgroundColor: "#fff",
          margin: 0,
          padding: "1rem",
        }}
      >
        <Navbar />
        <h1>Error</h1>
        <p>{error}</p>
        <Link to="/">Back to Home</Link>
      </div>
    );
  }

  return (
    <div style={{ minWidth: "100%", backgroundColor: "#fff", margin: 0 }}>
      <Navbar />
      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "1rem" }}>
        <h1>Listing Details</h1>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <h2>{listing.title}</h2>
          <p>{listing.description || "No description"}</p>
          {listing.price && <p>Price: ${listing.price.toFixed(2)}</p>}
          {listing.image_url && (
            <img
              src={listing.image_url}
              alt={listing.title}
              style={{ width: "100%" }}
            />
          )}
          <p>Category: {listing.category?.name || "Unknown"}</p>
          <p>Posted by: {listing.owner?.username || "Unknown"}</p>
          <p>Created: {new Date(listing.created_at).toLocaleDateString()}</p>

          <div style={{ marginBottom: "0.75rem" }}>
            <label htmlFor="favorite_note">Note (optional)</label>
            <textarea
              id="favorite_note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note about this favorite..."
              rows={3}
              style={{ width: "100%", padding: "0.5rem" }}
              disabled={isFavorited || isFavoriteLoading}
            />
          </div>

          <button
            onClick={handleToggleFavorite}
            disabled={isFavoriteLoading}
            style={{
              width: "100%",
              padding: "0.5rem",
              backgroundColor: isFavorited ? "#d32f2f" : "#1976d2",
              color: "#fff",
            }}
          >
            {isFavoriteLoading
              ? "Processing..."
              : isFavorited
              ? "Remove from Favorites"
              : "Add to Favorites"}
          </button>
        </div>
      </main>
    </div>
  );
}