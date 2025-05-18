import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useParams, useNavigate } from "react-router-dom";
import { fetchUser, logout } from "../store/authSlice";
import { fetchCategories } from "../store/categoriesSlice";
import Navbar from "./navbar";

export default function CategoryListings() {
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const token = useSelector((state) => state.auth.token);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  // const category = useSelector((state) => state.categories.byId[id]);
  // const status = useSelector((state) => state.categories.status);
  // const error = useSelector((state) => state.categories.error);

  const cachedUser = useSelector((state) => state.auth.user);
  const cachedCategories = useSelector((state) => state.categories.categories);
  const cachedMyCategories = useSelector((state) => state.auth.myCategories);
  const selectedCategory = cachedMyCategories.find(
    (category) => category.id === parseInt(id)
  );

  useEffect(() => {
    if (!isAuthenticated || !token) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);

        if (!cachedUser) {
          const resultAction = await dispatch(fetchUser());
          if (fetchUser.rejected.match(resultAction)) {
            dispatch(logout());
            navigate("/login");
            return;
          }

          //  const userData = resultAction.payload;

          //console.log("user Listings:", userData?.listings?.length);

          // Extract and dispatch listings and favorites from userData
          //if (userData?.listings?.length) {
          // dispatch(addMyListings(userData.listings));
          // setListings(userData.listings);
          //}
        } else {
          // If user is already cached, use cached listings and favorites
          // setListings(Object.values(cachedMyListings));
        }

        // Fetch Listings if not present
        if (cachedCategories.length === 0) {
          const categoriesResult = await dispatch(fetchCategories());
          console.log("categoriesResult", categoriesResult);

          if (fetchCategories.rejected.match(categoriesResult)) {
            throw new Error(
              categoriesResult.payload || "Failed to load categories"
            );
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id, isAuthenticated, dispatch]);

  if (isLoading) {
    return (
      <div
        style={{ minWidth: "100%", backgroundColor: "#fff", padding: "1rem" }}
      >
        <Navbar />
        <h1 style={{ fontSize: "1.5rem", color: "#333" }}>
          Loading listings...
        </h1>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{ minWidth: "100%", backgroundColor: "#fff", padding: "1rem" }}
      >
        <Navbar />
        <h1 style={{ fontSize: "1.5rem", color: "#333" }}>Error</h1>
        <p style={{ fontSize: "0.9rem", color: "#d32f2f" }}>{error}</p>
        <Link
          to="/my-categories"
          style={{ fontSize: "0.9rem", color: "#1976d2" }}
        >
          Back to My Categories
        </Link>
      </div>
    );
  }

  //  const listings = category?.listings || [];

  return (
    <div style={{ minWidth: "100%", backgroundColor: "#fff" }}>
      <Navbar />
      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "1rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: "600", color: "#333" }}>
          Listings in {selectedCategory?.name || "Category"}
        </h1>

        {selectedCategory.listings.length === 0 ? (
          <p style={{ fontSize: "0.9rem", color: "#333" }}>
            No listings available in this category.
          </p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {selectedCategory.listings.map((listing) => (
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
