import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Routes, Route } from "react-router-dom";
import { fetchUser, logout } from "../store/authSlice";
import Home from "./home.jsx";
import Listings from "./listings.jsx";
import Listing from "./listing.jsx";
import Dashboard from "./dashboard.jsx";
import Login from "./login.jsx";
import Signup from "./signup.jsx";
import MyCategories from "./my_categories.jsx";
import CategoryListings from "./category_listings.jsx";
import Navbar from "./navbar.jsx";
import { useNavigate } from "react-router-dom";
import { fetchCategories } from "../store/categoriesSlice";
import AllCategories from "./all_categories.jsx";

const App = () => {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const user = useSelector((state) => state.auth.user);
  const cachedCategories = useSelector((state) => state.categories.categories);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    console.log("Re-rendering App component");

    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch categories if not already loaded
        if (cachedCategories.length === 0) {
          console.log("fetchCategories API Call in App");

          const categoriesResult = await dispatch(fetchCategories());

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

    const initializeUser = async () => {
      if (isAuthenticated && token && !user) {
        try {
          console.log("fetchUser API Call in App");

          const resultAction = await dispatch(fetchUser());
          if (fetchUser.rejected.match(resultAction)) {
            dispatch(logout());
            navigate("/login");
          }
        } catch (err) {
          console.error("Failed to fetch user:", err);
        }
      }
    };

    loadData();
    initializeUser();
  }, [dispatch, navigate]);

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

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/listings" element={<Listings />} />
      <Route path="/listings/:id" element={<Listing />} />
      <Route path="/my-categories" element={<MyCategories />} />
      <Route path="/all-categories" element={<AllCategories />} />
      <Route path="/category-listings/:id" element={<CategoryListings />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
    </Routes>
  );
};

export default App;

