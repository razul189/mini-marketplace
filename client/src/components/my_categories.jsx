import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "./navbar";

/**
 * MyCategories component for viewing the authenticated user's categories.
 * Displays only the categories where the user has listings, with nested listings.
 */
export default function MyCategories() {
  // State for categories, loading, and errors
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Redux auth state
  const token = useSelector((state) => state.auth.token);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Fetch user's categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      if (!isAuthenticated || !token) {
        setError("Please log in to view your categories");
        navigate("/login");
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch(
          "http://localhost:5000/api/me/categories",
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 401) {
          dispatch({ type: "CLEAR_AUTH" });
          navigate("/login");
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch your categories");
        }

        const data = await response.json();
        setCategories(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [isAuthenticated, token, dispatch, navigate]);

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
          Loading your categories...
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

  // Render user's categories list
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
          My Categories
        </h1>
        <section>
          {categories.length === 0 ? (
            <p
              style={{
                fontSize: "0.9rem",
                color: "#333",
                margin: "0",
              }}
            >
              You have no categories with listings.
            </p>
          ) : (
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
              }}
            >
              {categories.map((category) => (
                <li
                  key={category.id}
                  style={{
                    padding: "0.75rem 0",
                    borderBottom: "1px solid #e0e0e0",
                  }}
                >
                  <Link
                    to={`/category-listings/${category.id}`}
                    style={{
                      fontSize: "1.1rem",
                      color: "#1976d2",
                      textDecoration: "none",
                    }}
                  >
                    {category.name}
                  </Link>
                  <p
                    style={{
                      fontSize: "0.9rem",
                      color: "#555",
                      margin: "0.25rem 0",
                    }}
                  >
                    {category.listings.length} listing
                    {category.listings.length !== 1 ? "s" : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
        <Link
          to="/listings"
          style={{
            display: "inline-block",
            marginTop: "1rem",
            fontSize: "0.9rem",
            color: "#1976d2",
            textDecoration: "none",
          }}
        >
          View All My Listings
        </Link>
      </main>
    </div>
  );
}