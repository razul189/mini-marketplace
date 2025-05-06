import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/authSlice";

/**
 * Navbar component for site navigation.
 * Displays links based on authentication status with a responsive mobile menu.
 * Updated to reflect new routes: '/my-categories' instead of '/categories'.
 */
export default function Navbar() {
  // Redux auth state
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // State for mobile menu toggle
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handle logout
  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
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
            My Listings
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

        {/* Mobile Menu Toggle */}
        <button
          onClick={toggleMobileMenu}
          style={{
            display: "none",
            background: "none",
            border: "none",
            fontSize: "1.25rem",
            cursor: "pointer",
          }}
        >
          {isMobileMenuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div
          style={{
            backgroundColor: "#fff",
            padding: "0.75rem 1rem",
            borderTop: "1px solid #e0e0e0",
          }}
        >
          <Link
            to="/listings"
            onClick={toggleMobileMenu}
            style={{
              display: "block",
              color: "#333",
              textDecoration: "none",
              fontSize: "0.9rem",
              padding: "0.5rem 0",
            }}
          >
            Listings
          </Link>
          <Link
            to="/my-categories"
            onClick={toggleMobileMenu}
            style={{
              display: "block",
              color: "#333",
              textDecoration: "none",
              fontSize: "0.9rem",
              padding: "0.5rem 0",
            }}
          >
            My Categories
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                onClick={toggleMobileMenu}
                style={{
                  display: "block",
                  color: "#333",
                  textDecoration: "none",
                  fontSize: "0.9rem",
                  padding: "0.5rem 0",
                }}
              >
                Dashboard
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  toggleMobileMenu();
                }}
                style={{
                  display: "block",
                  color: "#d32f2f",
                  background: "none",
                  border: "none",
                  fontSize: "0.9rem",
                  padding: "0.5rem 0",
                  textAlign: "left",
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
                onClick={toggleMobileMenu}
                style={{
                  display: "block",
                  color: "#333",
                  textDecoration: "none",
                  fontSize: "0.9rem",
                  padding: "0.5rem 0",
                }}
              >
                Login
              </Link>
              <Link
                to="/signup"
                onClick={toggleMobileMenu}
                style={{
                  display: "block",
                  color: "#333",
                  textDecoration: "none",
                  fontSize: "0.9rem",
                  padding: "0.5rem 0",
                }}
              >
                Signup
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}