import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "./navbar";
import { fetchUser } from "../store/authSlice"; // adjust the path if needed
import { fetchCategories } from "../store/categoriesSlice"; // adjust the path if needed
/**
 * MyCategories component for viewing the authenticated user's categories.
 * Displays only the categories where the user has listings, with nested listings.
 */
export default function MyCategories() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    token,
    isAuthenticated,
    user,
    error: authError,
  } = useSelector((state) => state.auth);
  const cachedUser = useSelector((state) => state.auth.user);
  const cachedMyCategories = useSelector((state) => state.auth.myCategories);
  const cachedCategories = useSelector((state) => state.categories.categories);
  const [categoriesWithListings, setCategoriesWithListings] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  console.log("cachedMyCategories", cachedMyCategories);

  // console.log("CategoriesWithListings - ", categoriesWithListings);

  useEffect(() => {
    const loadUserData = async () => {
      if (!isAuthenticated || !token) {
        navigate("/login");
        return;
      }

      setIsLoading(true);
      if (!cachedUser) {
        const resultAction = await dispatch(fetchUser());

        if (fetchUser.rejected.match(resultAction)) {
          dispatch(logout());
          navigate("/login");
          return;
        }
      }

      if (cachedCategories.length === 0) {
        const categoriesResult = await dispatch(fetchCategories());
        console.log("categoriesResult", categoriesResult);

        if (fetchCategories.rejected.match(categoriesResult)) {
          throw new Error(
            categoriesResult.payload || "Failed to load categories"
          );
        }
      }

      setIsLoading(false);
    };

    loadUserData();
  }, []);

  if (isLoading) {
    return (
      <div
        style={{ minWidth: "100%", backgroundColor: "#fff", padding: "1rem" }}
      >
        <Navbar />
        <h1 style={{ fontSize: "1.5rem", color: "#333" }}>
          Loading your categories...
        </h1>
      </div>
    );
  }

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
          My Categories
        </h1>
        <section>
          {cachedMyCategories.length === 0 ? (
            <p style={{ fontSize: "0.9rem", color: "#333" }}>
              You have no categories with listings.
            </p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {cachedMyCategories.map((category) => (
                <li
                  key={category.id}
                  style={{
                    padding: "0.75rem 0",
                    borderBottom: "1px solid #e0e0e0",
                  }}
                >
                  <Link
                    to={`/category-listings/${category.id}`}
                    style={{ fontSize: "1.1rem", color: "#1976d2" }}
                  >
                    {category.name}
                  </Link>
                  <p style={{ fontSize: "0.9rem", color: "#555" }}>
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
          }}
        >
          View All My Listings
        </Link>
      </main>
    </div>
  );
}
