import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "./navbar";
import CreateCategory from "./create_category";

export default function AllCategories() {
  const navigate = useNavigate();
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const {
    token,
    isAuthenticated,
    user,
    error: authError,
  } = useSelector((state) => state.auth);

  // const cachedMyCategories = useSelector((state) => state.auth.myCategories);
  const cachedCategories = useSelector((state) => state.categories.categories);

  useEffect(() => {
    const loadUserData = async () => {
      if (!isAuthenticated || !token) {
        navigate("/login");
        return;
      }
    };

    loadUserData();
  }, []);

  if (authError) {
    return (
      <div
        style={{ minWidth: "100%", backgroundColor: "#fff", padding: "1rem" }}
      >
        <Navbar />
        <h1 style={{ fontSize: "1.5rem", color: "#333" }}>Error</h1>
        <p style={{ color: "#d32f2f" }}>{authError}</p>
        <Link to="/" style={{ color: "#1976d2" }}>
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div style={{ minWidth: "100%", backgroundColor: "#fff" }}>
      <Navbar />
      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "1rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: "600", color: "#333" }}>
          All Categories
        </h1>
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
        <section>
          {cachedCategories.length === 0 ? (
            <p style={{ fontSize: "0.9rem", color: "#333" }}>
              You have no categories with listings.
            </p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {cachedCategories.map((category) => (
                <li
                  key={category.id}
                  style={{
                    padding: "0.75rem 0",
                    borderBottom: "1px solid #e0e0e0",
                  }}
                >
                  <p>{category.name}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
        {/* <Link
          to="/listings"
          style={{
            display: "inline-block",
            marginTop: "1rem",
            fontSize: "0.9rem",
            color: "#1976d2",
          }}
        >
          View All My Listings
        </Link> */}
      </main>

      <CreateCategory
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
      />
    </div>
  );
}
