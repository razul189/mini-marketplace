import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import CreateListings from "./create_listing";
import CreateCategory from "./create_category";
import Navbar from "./navbar";
import { addFavorites, removeFavorite } from "../store/favoritesSlice";
import {
  addMyListings,
  updateMyListing,
  removeMyListing,
} from "../store/myListingsSlice";
import { removeListing, updateListing } from "../store/listingsSlice";

/**
 * Dashboard component that displays user profile, listings, and favorites.
 * Requires authentication and handles data fetching, favorite deletion, note editing, and category/listing creation.
 */
export default function Dashboard() {
  // State for user data, listings, favorites, loading, error, and modals
  const [user, setUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isListingModalOpen, setIsListingModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editListing, setEditListing] = useState(null);
  const [isEditNoteModalOpen, setIsEditNoteModalOpen] = useState(false);
  const [editFavorite, setEditFavorite] = useState(null);

  const token = useSelector((state) => state.auth.token);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const cachedUser = useSelector((state) => state.auth.user);
  const cachedMyListings = useSelector((state) => state.myListings.byId);
  const cachedFavorites = useSelector((state) => state.favorites.byId);
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

    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch user
        let currentUser = cachedUser;
        if (!cachedUser) {
          const userResponse = await fetch("http://localhost:5000/api/me", {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });
          if (userResponse.status === 401 || userResponse.status === 422) {
            dispatch({ type: "CLEAR_AUTH" });
            navigate("/login");
            return;
          }
          if (!userResponse.ok) {
            throw new Error("Failed to fetch user data");
          }
          currentUser = await userResponse.json();
          dispatch({ type: "SET_USER", payload: currentUser });
          setUser(currentUser);
        } else {
          setUser(cachedUser);
        }

        // Fetch listings
        if (Object.values(cachedMyListings).length === 0) {
          const listingsResponse = await fetch(
            "http://localhost:5000/api/me/listings",
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (
            listingsResponse.status === 401 ||
            listingsResponse.status === 422
          ) {
            dispatch({ type: "CLEAR_AUTH" });
            navigate("/login");
            return;
          }
          if (!listingsResponse.ok) {
            throw new Error("Failed to fetch listings");
          }
          const listingsData = await listingsResponse.json();
          console.log("listingsData:", listingsData);

          dispatch(addMyListings(listingsData));
          setListings(listingsData);
        } else {
          setListings(Object.values(cachedMyListings));
        }

        // Always fetch favorites to ensure cache is up-to-date
        const favoritesResponse = await fetch(
          "http://localhost:5000/api/favorites",
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
          dispatch({ type: "CLEAR_AUTH" });
          navigate("/login");
          return;
        }
        if (!favoritesResponse.ok) {
          throw new Error("Failed to fetch favorites");
        }
        const favoritesData = await favoritesResponse.json();
        dispatch(addFavorites(favoritesData));
        setFavorites(favoritesData);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [
    isAuthenticated,
    token,
    cachedUser,
    cachedMyListings,
    navigate,
    dispatch,
  ]);

  // Handle favorite deletion
  const handleDeleteFavorite = async (favoriteId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/favorites/${favoriteId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 401 || response.status === 422) {
        dispatch({ type: "CLEAR_AUTH" });
        navigate("/login");
        return;
      }
      // If favorite doesn't exist (e.g., already deleted), remove from cache
      if (response.status === 404) {
        dispatch(removeFavorite(favoriteId));
        setFavorites(favorites.filter((fav) => fav.id !== favoriteId));
        return;
      }
      if (!response.ok) {
        throw new Error("Failed to delete favorite");
      }
      dispatch(removeFavorite(favoriteId));
      setFavorites(favorites.filter((fav) => fav.id !== favoriteId));
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle note update for a favorite
  const handleUpdateNote = async (e) => {
    e.preventDefault();
    if (!editFavorite) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/favorites/${editFavorite.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            item_listing_id: editFavorite.item_listing_id,
            note: editFavorite.note ? editFavorite.note.trim() : null,
          }),
        }
      );

      if (response.status === 401 || response.status === 422) {
        dispatch({ type: "CLEAR_AUTH" });
        navigate("/login");
        return;
      }
      if (response.status === 404) {
        // Favorite no longer exists, remove from cache
        dispatch(removeFavorite(editFavorite.id));
        setFavorites(favorites.filter((fav) => fav.id !== editFavorite.id));
        setIsEditNoteModalOpen(false);
        setEditFavorite(null);
        return;
      }
      if (!response.ok) {
        throw new Error("Failed to update note");
      }

      const updatedFavorite = await response.json();
      dispatch(addFavorites([updatedFavorite]));
      setFavorites((prevFavorites) =>
        prevFavorites.map((fav) =>
          fav.id === updatedFavorite.id ? updatedFavorite : fav
        )
      );
      setIsEditNoteModalOpen(false);
      setEditFavorite(null);
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle delete listing
  const handleDeleteListing = async (listingId) => {
    try {
      // Fetch favorites associated with the listing
      const favoritesResponse = await fetch(
        `http://localhost:5000/api/favorites?item_listing_id=${listingId}`,
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
        dispatch({ type: "CLEAR_AUTH" });
        navigate("/login");
        return;
      }
      if (!favoritesResponse.ok) {
        throw new Error("Failed to fetch favorites for listing");
      }
      const listingFavorites = await favoritesResponse.json();

      // Delete each associated favorite
      for (const favorite of listingFavorites) {
        const deleteFavoriteResponse = await fetch(
          `http://localhost:5000/api/favorites/${favorite.id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (
          deleteFavoriteResponse.status === 401 ||
          deleteFavoriteResponse.status === 422
        ) {
          dispatch({ type: "CLEAR_AUTH" });
          navigate("/login");
          return;
        }
        if (
          !deleteFavoriteResponse.ok &&
          deleteFavoriteResponse.status !== 404
        ) {
          throw new Error(`Failed to delete favorite ${favorite.id}`);
        }
        dispatch(removeFavorite(favorite.id));
      }

      // Delete the listing
      const response = await fetch(
        `http://localhost:5000/api/listings/${listingId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 401 || response.status === 422) {
        dispatch({ type: "CLEAR_AUTH" });
        navigate("/login");
        return;
      }
      if (response.ok) {
        dispatch(removeMyListing(listingId));
        dispatch(removeListing(listingId));
        setListings(listings.filter((listing) => listing.id !== listingId));
        // Update local favorites state to remove deleted favorites
        setFavorites(
          favorites.filter((fav) => fav.item_listing_id !== listingId)
        );
      } else if (response.status === 403) {
        alert("You are not authorized to delete this listing.");
      } else {
        throw new Error("Failed to delete listing");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle update listing
  const handleUpdateListing = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/listings/${editListing.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: editListing.title,
            description: editListing.description,
            price: editListing.price,
            category_id: editListing.category?.id,
            user_id: user.id,
          }),
        }
      );
      if (response.ok) {
        const updatedListing = await response.json();
        dispatch(updateMyListing(updatedListing));
        dispatch(updateListing(updatedListing));
        setListings((prevListings) =>
          prevListings.map((l) =>
            l.id === updatedListing.id ? updatedListing : l
          )
        );
        setIsEditModalOpen(false);
        setEditListing(null);
      } else if (response.status === 403) {
        alert("You are not authorized to edit this listing.");
      } else {
        throw new Error("Failed to update listing");
      }
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
        {user && (
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
                Username: {user.username}
              </p>
              <p
                style={{
                  fontSize: "0.9rem",
                  color: "#333",
                  margin: "0 0 0.25rem 0",
                }}
              >
                Email: {user.email}
              </p>
              <p
                style={{
                  fontSize: "0.9rem",
                  color: "#333",
                  margin: "0 0 0.25rem 0",
                }}
              >
                Joined: {new Date(user.created_at).toLocaleDateString()}
              </p>
            </section>

            <button
              onClick={() => setIsCategoryModalOpen(true)}
              style={{
                padding: "0.5rem",
                backgroundColor: "#1976d2",
                color: "#fff",
                border: "none",
                fontSize: "0.9rem",
                cursor: "pointer",
                marginBottom: "0.5rem",
              }}
            >
              Create New Category
            </button>

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
              {listings.length === 0 ? (
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
                  {listings.map((listing) => (
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
              {favorites.length === 0 ? (
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
                  {favorites.map((favorite) => (
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
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await handleUpdateListing();
              }}
            >
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
      <CreateCategory
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
      />
      <CreateListings
        isOpen={isListingModalOpen}
        onClose={() => setIsListingModalOpen(false)}
      />
    </div>
  );
}
