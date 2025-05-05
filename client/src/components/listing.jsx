import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import Navbar from "./navbar";

/**
 * Listing component that fetches and displays details of a single item listing
 * based on the ID provided in the URL, with a button to toggle favorite status and add a note.
 */
export default function Listing() {
  // State for listing data, favorite status, note, loading, and errors
  const [listing, setListing] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [note, setNote] = useState("");
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Extract listing ID from URL parameters
  const { id } = useParams();

  // Get JWT token from Redux store
  const token = useSelector((state) => state.auth.token);

  // Fetch listing and favorite status when component mounts or ID changes
  useEffect(() => {
    const fetchListingAndFavorites = async () => {
      try {
        setIsLoading(true);

        // Fetch listing
        const listingResponse = await fetch(
          `http://localhost:5000/api/listings/${id}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!listingResponse.ok) {
          if (listingResponse.status === 404) {
            throw new Error("Listing not found");
          }
          throw new Error(`Failed to fetch listing: ${listingResponse.status}`);
        }

        const listingData = await listingResponse.json();
        setListing(listingData);

        // Fetch favorites if authenticated
        if (token) {
          const favoritesResponse = await fetch(
            `http://localhost:5000/api/favorites`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (
            favoritesResponse.status === 401 ||
            favoritesResponse.status === 422
          ) {
            setIsFavorited(false);
          } else if (!favoritesResponse.ok) {
            throw new Error("Failed to fetch favorites");
          } else {
            const favoritesData = await favoritesResponse.json();
            const favorite = favoritesData.find(
              (fav) => fav.item_listing_id === parseInt(id)
            );
            setIsFavorited(!!favorite);
            if (favorite && favorite.note) {
              setNote(favorite.note);
            } else {
              setNote("");
            }
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchListingAndFavorites();
  }, [id, token]);

  // Toggle favorite status
  const handleToggleFavorite = async () => {
    if (!token) {
      setError("Please log in to favorite this listing");
      return;
    }

    setIsFavoriteLoading(true);
    try {
      if (isFavorited) {
        // Find the favorite record to delete
        const favoritesResponse = await fetch(
          `http://localhost:5000/api/favorites`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!favoritesResponse.ok) {
          throw new Error("Failed to fetch favorites for deletion");
        }

        const favoritesData = await favoritesResponse.json();
        const favorite = favoritesData.find(
          (fav) => fav.item_listing_id === parseInt(id)
        );

        if (favorite) {
          const deleteResponse = await fetch(
            `http://localhost:5000/api/favorites/${favorite.id}`,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!deleteResponse.ok) {
            if (deleteResponse.status === 403) {
              throw new Error("You are not authorized to remove this favorite");
            }
            throw new Error("Failed to remove favorite");
          }

          setIsFavorited(false);
          setNote("");
        }
      } else {
        // Add new favorite with note
        const addResponse = await fetch(`http://localhost:5000/api/favorites`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            item_listing_id: parseInt(id),
            note: note.trim() || null,
          }),
        });

        if (!addResponse.ok) {
          if (addResponse.status === 400) {
            throw new Error("Invalid listing ID");
          }
          throw new Error("Failed to add favorite");
        }

        setIsFavorited(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  // Render loading state
  if (isLoading) {
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
        <h1
          style={{
            fontSize: "1.5rem",
            color: "#333",
            margin: "0 0 1rem 0",
          }}
        >
          Loading listing...
        </h1>
      </div>
    );
  }

  // Render error state
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
        <h1
          style={{
            fontSize: "1.5rem",
            color: "#333",
            margin: "0 0 1rem 0",
          }}
        >
          Error
        </h1>
        <p
          style={{
            fontSize: "0.9rem",
            color: "#d32f2f",
            margin: "0 0 0.75rem 0",
          }}
        >
          {error}
        </p>
        <Link
          to="/"
          style={{
            fontSize: "0.9rem",
            color: "#1976d2",
            textDecoration: "none",
          }}
        >
          Back to Home
        </Link>
      </div>
    );
  }

  // Render listing details
  return (
    <div
      style={{
        minWidth: "100%",
        backgroundColor: "#fff",
        margin: 0,
      }}
    >
      <Navbar />
      <main
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "1rem",
        }}
      >
        <h1
          style={{
            fontSize: "1.5rem",
            fontWeight: "600",
            color: "#333",
            margin: "0 0 1rem 0",
          }}
        >
          Listing Details
        </h1>
        {listing && (
          <div
            style={{
              maxWidth: "600px",
              margin: "0 auto",
            }}
          >
            <h2
              style={{
                fontSize: "1.25rem",
                fontWeight: "600",
                color: "#333",
                margin: "0 0 0.5rem 0",
              }}
            >
              {listing.title}
            </h2>
            <p
              style={{
                fontSize: "0.9rem",
                color: "#555",
                margin: "0 0 0.5rem 0",
              }}
            >
              {listing.description || "No description"}
            </p>
            {listing.price && (
              <p
                style={{
                  fontSize: "0.9rem",
                  color: "#333",
                  margin: "0 0 0.5rem 0",
                }}
              >
                Price: ${listing.price.toFixed(2)}
              </p>
            )}
            {listing.image_url && (
              <img
                src={listing.image_url}
                alt={listing.title}
                style={{
                  maxWidth: "100%",
                  height: "auto",
                  margin: "0 0 0.5rem 0",
                }}
              />
            )}
            <p
              style={{
                fontSize: "0.9rem",
                color: "#333",
                margin: "0 0 0.5rem 0",
              }}
            >
              Category: {listing.category?.name || "Unknown"}
            </p>
            <p
              style={{
                fontSize: "0.9rem",
                color: "#333",
                margin: "0 0 0.5rem 0",
              }}
            >
              Posted by: {listing.owner?.username || "Unknown"}
            </p>
            <p
              style={{
                fontSize: "0.9rem",
                color: "#333",
                margin: "0 0 0.5rem 0",
              }}
            >
              Created: {new Date(listing.created_at).toLocaleDateString()}
            </p>
            <div style={{ marginBottom: "0.75rem" }}>
              <label
                htmlFor="favorite_note"
                style={{
                  display: "block",
                  fontSize: "0.9rem",
                  color: "#333",
                  marginBottom: "0.25rem",
                }}
              >
                Note (optional)
              </label>
              <textarea
                id="favorite_note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note about this favorite..."
                rows={3}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #e0e0e0",
                  fontSize: "0.9rem",
                  color: "#333",
                  resize: "vertical",
                }}
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
                border: "none",
                fontSize: "0.9rem",
                cursor: isFavoriteLoading ? "not-allowed" : "pointer",
                margin: "0.75rem 0",
              }}
            >
              {isFavoriteLoading
                ? "Processing..."
                : isFavorited
                ? "Remove from Favorites"
                : "Add to Favorites"}
            </button>
            <p
              style={{
                fontSize: "0.9rem",
                color: "#333",
                margin: "0",
              }}
            >
              <Link
                to="/"
                style={{
                  color: "#1976d2",
                  textDecoration: "none",
                }}
              >
                Back to Home
              </Link>
            </p>
          </div>
        )}
      </main>
    </div>
  );
}