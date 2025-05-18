import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import CreateListings from "./create_listing";

import Navbar from "./navbar";
import { deleteListing, updateListing } from "../store/categoriesSlice";
import {
  logout,
  deleteMyListing,
  updateMyListing,
  toggleFavorite,
} from "../store/authSlice";
import { updateFavoriteNote } from "../store/authSlice";

/**
 * Dashboard component that displays user profile, listings, and favorites.
 * Requires authentication and handles data fetching, favorite deletion, note editing, and category/listing creation.
 */
export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isListingModalOpen, setIsListingModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editListing, setEditListing] = useState(null);
  const [isEditNoteModalOpen, setIsEditNoteModalOpen] = useState(false);
  const [editFavorite, setEditFavorite] = useState(null);

  const token = useSelector((state) => state.auth.token);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  // console.log("isAuthenticated", isAuthenticated);

  const cachedUser = useSelector((state) => state.auth.user);
  const cachedMyListings = useSelector((state) => state.auth.myListings);
  const cachedMyFavorites = useSelector((state) => state.auth.myFavorites);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const openEditModal = (listing) => {
    setEditListing(listing);
    setIsEditModalOpen(true);
  };

  const openEditNoteModal = (favorite) => {
    setEditFavorite(favorite);
    setIsEditNoteModalOpen(true);
  };

  // Fetch user data, listings, and favorites on mount or auth change
  useEffect(() => {
    if (!isAuthenticated || !token) {
      navigate("/login");
      return;
    }
  }, []);

  // Handle favorite deletion
  const handleDeleteFavorite = async (favoriteId) => {
    try {
      const favorite = cachedMyFavorites.find((fav) => fav.id === favoriteId);
      if (!favorite) return;

      const res = await dispatch(
        toggleFavorite({
          id: favorite.item_listing_id,
          note: favorite.note,
          token,
          isFavorited: true,
        })
      );
      console.log("Deleted favorite:", res);
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle note update for a favorite
  const handleUpdateNote = async (e) => {
    e.preventDefault();
    if (!editFavorite) return;
    console.log("editFavorite", editFavorite);

    try {
      const resultAction = await dispatch(
        updateFavoriteNote({
          id: editFavorite.id,
          item_listing_id: editFavorite.item_listing_id,
          note: editFavorite.note ? editFavorite.note.trim() : null,
        })
      );

      if (updateFavoriteNote.rejected.match(resultAction)) {
        const error = resultAction.payload;
        if (error === "Unauthorized" || error === "Unprocessable Entity") {
          dispatch(logout());
          navigate("/login");
          return;
        }
        if (error === "Not Found") {
          // dispatch(removeFavorite(editFavorite.id));
          setIsEditNoteModalOpen(false);
          setEditFavorite(null);
          return;
        }

        throw new Error(error);
      }

      setIsEditNoteModalOpen(false);
      setEditFavorite(null);
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle delete listing
  const handleDeleteListing = async (listingId) => {
    try {
      // 1. Delete Listing with Favorites.
      const resultAction = await dispatch(
        deleteMyListing({ listingId, token })
      );

      if (deleteMyListing.rejected.match(resultAction)) {
        const error = resultAction.payload;
        if (error === "Unauthorized") {
          dispatch(logout());
          navigate("/login");
          return;
        }
        if (error === "Forbidden") {
          alert("You are not authorized to delete this listing.");
          return;
        }

        throw new Error(error);
      }

      dispatch(deleteListing(listingId));

      // Optimistically update local listings state
      // setListings((prev) => prev.filter((listing) => listing.id !== listingId));
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle update listing
  const handleUpdateListing = async (e) => {
    try {
      e.preventDefault();
      console.log("editListing");

      const resultAction = await dispatch(
        updateMyListing({
          listing: {
            ...editListing,
            user_id: cachedUser.id,
          },
          token,
        })
      );

      if (updateMyListing.rejected.match(resultAction)) {
        const error = resultAction.payload;
        if (error === "Unauthorized") {
          dispatch(logout());
          navigate("/login");
          return;
        }
        if (error === "Forbidden") {
          alert("You are not authorized to edit this listing.");
          return;
        }
        throw new Error(error);
      }

      const updatedListing = resultAction.payload;
      dispatch(updateListing(updatedListing));

      // setListings((prev) =>
      //   prev.map((l) => (l.id === updatedListing.id ? updatedListing : l))
      // );
      setIsEditModalOpen(false);
      setEditListing(null);
    } catch (err) {
      setError(err.message);
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
          Loading dashboard...
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

  // Render dashboard
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
          Dashboard
        </h1>
        {cachedUser && (
          <div>
            <section
              style={{
                marginBottom: "1rem",
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
                User Profile
              </h2>
              <p
                style={{
                  fontSize: "0.9rem",
                  color: "#333",
                  margin: "0 0 0.25rem 0",
                }}
              >
                Username: {cachedUser.username}
              </p>
              <p
                style={{
                  fontSize: "0.9rem",
                  color: "#333",
                  margin: "0 0 0.25rem 0",
                }}
              >
                Email: {cachedUser.email}
              </p>
              <p
                style={{
                  fontSize: "0.9rem",
                  color: "#333",
                  margin: "0 0 0.25rem 0",
                }}
              >
                Joined: {new Date(cachedUser.created_at).toLocaleDateString()}
              </p>
            </section>

            <br />

            <button
              onClick={() => setIsListingModalOpen(true)}
              style={{
                padding: "0.5rem",
                backgroundColor: "#1976d2",
                color: "#fff",
                border: "none",
                fontSize: "0.9rem",
                cursor: "pointer",
                marginBottom: "1rem",
              }}
            >
              Create New Listing
            </button>
            <section
              style={{
                marginBottom: "1rem",
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
                My Listings
              </h2>
              {cachedMyListings.length === 0 ? (
                <p
                  style={{
                    fontSize: "0.9rem",
                    color: "#333",
                    margin: "0",
                  }}
                >
                  You have no listings yet.
                </p>
              ) : (
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                  }}
                >
                  {cachedMyListings.map((listing) => (
                    <li
                      key={listing.id}
                      style={{
                        padding: "0.75rem 0",
                        borderBottom: "1px solid #e0e0e0",
                      }}
                    >
                      <Link
                        to={`/listings/${listing.id}`}
                        style={{
                          fontSize: "1.1rem",
                          fontWeight: "600",
                          color: "#1976d2",
                          textDecoration: "none",
                        }}
                      >
                        {listing.title}
                      </Link>
                      <p
                        style={{
                          fontSize: "0.9rem",
                          color: "#555",
                          margin: "0.25rem 0",
                        }}
                      >
                        {listing.description || "No description"}
                      </p>
                      {listing.price && (
                        <p
                          style={{
                            fontSize: "0.9rem",
                            color: "#333",
                            margin: "0.25rem 0",
                          }}
                        >
                          Price: ${listing.price.toFixed(2)}
                        </p>
                      )}
                      <p
                        style={{
                          fontSize: "0.9rem",
                          color: "#333",
                          margin: "0.25rem 0",
                        }}
                      >
                        Category: {listing.category?.name || "Unknown"}
                      </p>
                      <p
                        style={{
                          fontSize: "0.9rem",
                          color: "#333",
                          margin: "0.25rem 0",
                        }}
                      >
                        Created:{" "}
                        {new Date(listing.created_at).toLocaleDateString()}
                      </p>
                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              "Are you sure you want to delete this listing?"
                            )
                          ) {
                            handleDeleteListing(listing.id);
                          }
                        }}
                        style={{
                          padding: "0.5rem",
                          backgroundColor: "#d32f2f",
                          color: "#fff",
                          border: "none",
                          fontSize: "0.9rem",
                          cursor: "pointer",
                          marginTop: "0.5rem",
                        }}
                      >
                        Delete Listing
                      </button>
                      <button
                        onClick={() => openEditModal(listing)}
                        style={{
                          padding: "0.5rem",
                          backgroundColor: "#1976d2",
                          color: "#fff",
                          border: "none",
                          fontSize: "0.9rem",
                          cursor: "pointer",
                          marginTop: "0.5rem",
                          marginLeft: "0.5rem",
                        }}
                      >
                        Edit Listing
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <h2
                style={{
                  fontSize: "1.25rem",
                  fontWeight: "600",
                  color: "#333",
                  margin: "0 0 0.5rem 0",
                }}
              >
                My Favorites
              </h2>
              {cachedMyFavorites.length === 0 ? (
                <p
                  style={{
                    fontSize: "0.9rem",
                    color: "#333",
                    margin: "0",
                  }}
                >
                  You have no favorites yet.
                </p>
              ) : (
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                  }}
                >
                  {cachedMyFavorites.map((favorite) => (
                    <li
                      key={favorite.id}
                      style={{
                        padding: "0.75rem 0",
                        borderBottom: "1px solid #e0e0e0",
                      }}
                    >
                      <Link
                        to={`/listings/${favorite.item_listing_id}`}
                        style={{
                          fontSize: "1.1rem",
                          fontWeight: "600",
                          color: "#1976d2",
                          textDecoration: "none",
                        }}
                      >
                        {favorite.listing?.title || "Unknown Listing"}
                      </Link>
                      <p
                        style={{
                          fontSize: "0.9rem",
                          color: "#555",
                          margin: "0.25rem 0",
                        }}
                      >
                        {favorite.listing?.description || "No description"}
                      </p>
                      <p
                        style={{
                          fontSize: "0.9rem",
                          color: "#333",
                          margin: "0.25rem 0",
                        }}
                      >
                        Category:{" "}
                        {favorite.listing?.category?.name || "Unknown"}
                      </p>
                      {favorite.note && (
                        <p
                          style={{
                            fontSize: "0.9rem",
                            color: "#333",
                            margin: "0.25rem 0",
                          }}
                        >
                          Note: {favorite.note}
                        </p>
                      )}
                      <p
                        style={{
                          fontSize: "0.9rem",
                          color: "#333",
                          margin: "0.25rem 0",
                        }}
                      >
                        Created:{" "}
                        {new Date(favorite.created_at).toLocaleDateString()}
                      </p>
                      <button
                        onClick={() => openEditNoteModal(favorite)}
                        style={{
                          padding: "0.5rem",
                          backgroundColor: "#1976d2",
                          color: "#fff",
                          border: "none",
                          fontSize: "0.9rem",
                          cursor: "pointer",
                          marginTop: "0.5rem",
                          marginRight: "0.5rem",
                        }}
                      >
                        Edit Note
                      </button>
                      <button
                        onClick={() => handleDeleteFavorite(favorite.id)}
                        style={{
                          padding: "0.5rem",
                          backgroundColor: "#d32f2f",
                          color: "#fff",
                          border: "none",
                          fontSize: "0.9rem",
                          cursor: "pointer",
                          marginTop: "0.5rem",
                        }}
                      >
                        Remove Favorite
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}
      </main>
      {isEditModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "2rem",
              borderRadius: "8px",
              width: "90%",
              maxWidth: "500px",
            }}
          >
            <h2>Edit Listing</h2>
            <form onSubmit={async (e) => handleUpdateListing(e)}>
              <input
                type="text"
                value={editListing?.title || ""}
                onChange={(e) =>
                  setEditListing({ ...editListing, title: e.target.value })
                }
                placeholder="Title"
                required
                style={{ width: "100%", marginBottom: "1rem" }}
              />
              <textarea
                value={editListing?.description || ""}
                onChange={(e) =>
                  setEditListing({
                    ...editListing,
                    description: e.target.value,
                  })
                }
                placeholder="Description"
                required
                style={{ width: "100%", marginBottom: "1rem" }}
              />
              <input
                type="number"
                value={editListing?.price || ""}
                onChange={(e) =>
                  setEditListing({
                    ...editListing,
                    price: parseFloat(e.target.value),
                  })
                }
                placeholder="Price"
                required
                style={{ width: "100%", marginBottom: "1rem" }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <button
                  type="submit"
                  style={{
                    backgroundColor: "#1976d2",
                    color: "#fff",
                    border: "none",
                    padding: "0.5rem 1rem",
                    cursor: "pointer",
                  }}
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  style={{
                    backgroundColor: "#d32f2f",
                    color: "#fff",
                    border: "none",
                    padding: "0.5rem 1rem",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isEditNoteModalOpen && editFavorite && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "2rem",
              borderRadius: "8px",
              width: "90%",
              maxWidth: "500px",
            }}
          >
            <h2>Edit Note for Favorite</h2>
            <form onSubmit={handleUpdateNote}>
              <textarea
                value={editFavorite.note || ""}
                onChange={(e) =>
                  setEditFavorite({ ...editFavorite, note: e.target.value })
                }
                placeholder="Add or edit your note..."
                rows={3}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #e0e0e0",
                  fontSize: "0.9rem",
                  color: "#333",
                  marginBottom: "1rem",
                  resize: "vertical",
                }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <button
                  type="submit"
                  style={{
                    backgroundColor: "#1976d2",
                    color: "#fff",
                    border: "none",
                    padding: "0.5rem 1rem",
                    cursor: "pointer",
                  }}
                >
                  Save Note
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditNoteModalOpen(false);
                    setEditFavorite(null);
                  }}
                  style={{
                    backgroundColor: "#d32f2f",
                    color: "#fff",
                    border: "none",
                    padding: "0.5rem 1rem",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <CreateListings
        isOpen={isListingModalOpen}
        onClose={() => setIsListingModalOpen(false)}
      />
    </div>
  );
}