import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "./navbar";

/**
 * Listings component that fetches and displays the authenticated user's listings.
 * Supports filtering by category via query parameters.
 */
export default function Listings() {
  // State for listings, categories, loading, and errors

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Redux auth state
  const token = useSelector((state) => state.auth.token);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const categoriesState = useSelector((state) => state.categories);

  // Categories from Redux
  const cachedCategories = categoriesState.categories;

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedCategoryListings, setSelectedCategoryListings] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Fetch listings and categories when component mounts or category changes
  useEffect(() => {
    const loadData = async () => {
      if (!isAuthenticated || !token) {
        setError("Please log in to view your listings");
        navigate("/login");
        return;
      }

      try {
        // setIsLoading(true);
        setSelectedCategoryListings(categoriesState.listings);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated, token, cachedCategories, dispatch]);

  // Handle category selection
  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    console.log("categoryId", categoryId);

    if (categoryId) {
      setSelectedCategory(
        cachedCategories.find((cat) => cat.id === Number(categoryId))
      );
      setSelectedCategoryListings(
        cachedCategories.find((cat) => cat.id === Number(categoryId)).listings
      );
      setSelectedCategoryId(categoryId);
    } else {
      setSelectedCategoryListings(categoriesState.listings);
      setSelectedCategory(null);
      setSelectedCategoryId("");
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
          Loading listings...
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

  // Render listings with category filter
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
          My Listings
        </h1>
        <section
          style={{
            marginBottom: "1rem",
          }}
        >
          <label
            htmlFor="category-filter"
            style={{
              fontSize: "0.9rem",
              color: "#333",
              marginRight: "0.5rem",
            }}
          >
            Filter by Category
          </label>
          <select
            id="category-filter"
            value={selectedCategoryId}
            onChange={handleCategoryChange}
            style={{
              padding: "0.5rem",
              border: "1px solid #e0e0e0",
              fontSize: "0.9rem",
              color: "#333",
            }}
          >
            <option value="">All Categories</option>
            {cachedCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </section>
        {selectedCategoryListings.length === 0 ? (
          <p
            style={{
              fontSize: "0.9rem",
              color: "#333",
              margin: "0",
            }}
          >
            No listings available.
          </p>
        ) : (
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
            }}
          >
            {selectedCategoryListings.map((listing) => (
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
                {listing.image_url && (
                  <img
                    src={listing.image_url}
                    alt={listing.title}
                    style={{
                      maxWidth: "200px",
                      height: "auto",
                      margin: "0.5rem 0",
                    }}
                  />
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
                  Created: {new Date(listing.created_at).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        )}
        <Link
          to="/my-categories"
          style={{
            display: "inline-block",
            marginTop: "1rem",
            fontSize: "0.9rem",
            color: "#1976d2",
            textDecoration: "none",
          }}
        >
          Back to My Categories
        </Link>
      </main>
    </div>
  );
}
