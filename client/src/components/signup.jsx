import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "./navbar";

/**
 * Signup component that renders a form for creating a new user account.
 * Submits user data to the API and handles success/error responses.
 */
export default function Signup() {
  // State for form inputs, errors, and loading
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:5000/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || "Failed to sign up");
      }

      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

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
          Sign Up
        </h1>
        <form
          onSubmit={handleSubmit}
          style={{
            maxWidth: "360px",
            margin: "0 auto",
          }}
        >
          <div style={{ marginBottom: "0.75rem" }}>
            <label
              htmlFor="username"
              style={{
                display: "block",
                fontSize: "0.9rem",
                color: "#333",
                marginBottom: "0.25rem",
              }}
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              minLength={3}
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "1px solid #e0e0e0",
                fontSize: "0.9rem",
                color: "#333",
              }}
            />
          </div>
          <div style={{ marginBottom: "0.75rem" }}>
            <label
              htmlFor="email"
              style={{
                display: "block",
                fontSize: "0.9rem",
                color: "#333",
                marginBottom: "0.25rem",
              }}
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "1px solid #e0e0e0",
                fontSize: "0.9rem",
                color: "#333",
              }}
            />
          </div>
          <div style={{ marginBottom: "0.75rem" }}>
            <label
              htmlFor="password"
              style={{
                display: "block",
                fontSize: "0.9rem",
                color: "#333",
                marginBottom: "0.25rem",
              }}
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "1px solid #e0e0e0",
                fontSize: "0.9rem",
                color: "#333",
              }}
            />
          </div>
          {error && (
            <p
              style={{
                fontSize: "0.9rem",
                color: "#d32f2f",
                margin: "0 0 0.75rem 0",
              }}
            >
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%",
              padding: "0.5rem",
              backgroundColor: isLoading ? "#ccc" : "#1976d2",
              color: "#fff",
              border: "none",
              fontSize: "0.9rem",
              cursor: isLoading ? "not-allowed" : "pointer",
            }}
          >
            {isLoading ? "Signing up..." : "Sign Up"}
          </button>
          <p
            style={{
              fontSize: "0.9rem",
              color: "#333",
              margin: "0.75rem 0 0 0",
              textAlign: "center",
            }}
          >
            Already have an account?{" "}
            <Link
              to="/login"
              style={{
                color: "#1976d2",
                textDecoration: "none",
              }}
            >
              Log In
            </Link>
          </p>
        </form>
      </main>
    </div>
  );
}
