import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/authSlice";
import { clearCategory } from "../store/categoriesSlice";
import { clearListing } from "../store/listingsSlice";
import { clearFavorite } from "../store/favoritesSlice";
import { clearMyListing } from "../store/myListingsSlice";


export default function Navbar() {
  // Redux auth state
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const dispatch = useDispatch();
  const navigate = useNavigate();


  // Handle logout
  const handleLogout = () => {
    dispatch(logout());
    // clear State
    dispatch(clearCategory()); 
    dispatch(clearListing());
    dispatch(clearFavorite());
    dispatch(clearMyListing());
    navigate("/login");
  };

  return (
    <nav
      style={{
        minWidth: "100%",
        backgroundColor: "#fff",
        padding: "0.75rem 1rem",
        borderBottom: "1px solid #e0e0e0",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Brand/Logo */}
        <Link
          to="/"
          style={{
            fontSize: "1.25rem",
            fontWeight: "600",
            color: "#333",
            textDecoration: "none",
          }}
        >
          Mini Marketplace
        </Link>
  
        {/* Desktop Menu */}
        <div
          style={{
            display: "flex",
            gap: "1rem",
            alignItems: "center",
          }}
        >
          <Link
            to="/listings"
            style={{
              color: "#333",
              textDecoration: "none",
              fontSize: "0.9rem",
            }}
          >
            Listings
          </Link>
          <Link
            to="/my-categories"
            style={{
              color: "#333",
              textDecoration: "none",
              fontSize: "0.9rem",
            }}
          >
            My Categories
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                style={{
                  color: "#333",
                  textDecoration: "none",
                  fontSize: "0.9rem",
                }}
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                style={{
                  color: "#d32f2f",
                  background: "none",
                  border: "none",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                style={{
                  color: "#333",
                  textDecoration: "none",
                  fontSize: "0.9rem",
                }}
              >
                Login
              </Link>
              <Link
                to="/signup"
                style={{
                  color: "#333",
                  textDecoration: "none",
                  fontSize: "0.9rem",
                }}
              >
                Signup
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}  
