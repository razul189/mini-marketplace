import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createCategory } from "../store/categoriesSlice";
import { addToMyCategories } from "../store/authSlice";

/**
 * CreateCategory modal component for creating a new category.
 * Displays a form in a modal, submits to the API, and requires authentication.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is open.
 * @param {Function} props.onClose - Callback to close the modal.
 */
export default function CreateCategory({ isOpen, onClose }) {
  // State for form input, error, and loading
  const [categoryName, setCategoryName] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.token);
  const dispatch = useDispatch();

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError("You must be logged in to create a category");
      return;
    }
    if (!categoryName.trim()) {
      setError("Category name is required");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const actionResult = await dispatch(
        createCategory({ name: categoryName.trim(), token })
      ).unwrap();
      console.log("Created Category:", actionResult);

      // Check for errors in the result of the async thunk action
      if (createCategory.rejected.match(actionResult)) {
        setError(actionResult.payload || "Failed to create category");
        setIsLoading(false);
        return;
      }

      // Successfully created category, close the modal and reset form
      dispatch(addToMyCategories(actionResult));
      onClose();
      setCategoryName("");
      setIsLoading(false);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  // Don't render if modal is not open
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        minWidth: "100%",
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
          padding: "1rem",
          maxWidth: "480px",
          width: "100%",
          margin: "1rem",
        }}
      >
        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: "600",
            color: "#333",
            margin: "0 0 1rem 0",
          }}
        >
          Create New Category
        </h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "0.75rem" }}>
            <label
              htmlFor="category_name"
              style={{
                display: "block",
                fontSize: "0.9rem",
                color: "#333",
                marginBottom: "0.25rem",
              }}
            >
              Category Name
            </label>
            <input
              type="text"
              id="category_name"
              name="category_name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              required
              minLength={1}
              maxLength={50}
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
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                flex: 1,
                padding: "0.5rem",
                backgroundColor: isLoading ? "#ccc" : "#1976d2",
                color: "#fff",
                border: "none",
                fontSize: "0.9rem",
                cursor: isLoading ? "not-allowed" : "pointer",
              }}
            >
              {isLoading ? "Creating..." : "Create Category"}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: "0.5rem",
                backgroundColor: "#d32f2f",
                color: "#fff",
                border: "none",
                fontSize: "0.9rem",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
