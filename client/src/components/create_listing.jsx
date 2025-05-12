import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
// import { addListings } from "../store/listingsSlice";
import { addCategories } from "../store/categoriesSlice";
import { addMyListings } from "../store/myListingsSlice";

/**
 * CreateListings modal component for creating a new item listing.
 * Displays a form in a modal, submits to the API, and requires authentication.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is open.
 * @param {Function} props.onClose - Callback to close the modal.
 */
export default function CreateListings({ isOpen, onClose }) {
  // State for form inputs, categories, error, and loading
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    image_url: "",
    category_id: "",
  });
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.token);
  const cachedCategories = useSelector((state) => state.categories.byId);
  const dispatch = useDispatch();

  // Fetch categories when modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchCategories = async () => {
        try {
          if (Object.values(cachedCategories).length === 0) {
            const response = await fetch(
              "http://localhost:5000/api/categories",
              {
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );
            if (!response.ok) {
              throw new Error("Failed to fetch categories");
            }
            const data = await response.json();
            dispatch(addCategories(data));
            setCategories(data);
          } else {
            setCategories(Object.values(cachedCategories));
          }
        } catch (err) {
          setError(err.message);
        }
      };
      fetchCategories();
    }
  }, [isOpen, cachedCategories, dispatch]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError("You must be logged in to create a listing");
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          price: formData.price ? parseFloat(formData.price) : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || "Failed to create listing");
      }

      dispatch(addMyListings([data]));
      onClose();
      navigate(`/listings/${data.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
          Create New Listing
        </h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "0.75rem" }}>
            <label
              htmlFor="title"
              style={{
                display: "block",
                fontSize: "0.9rem",
                color: "#333",
                marginBottom: "0.25rem",
              }}
            >
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              minLength={1}
              maxLength={140}
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
              htmlFor="description"
              style={{
                display: "block",
                fontSize: "0.9rem",
                color: "#333",
                marginBottom: "0.25rem",
              }}
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
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
              htmlFor="price"
              style={{
                display: "block",
                fontSize: "0.9rem",
                color: "#333",
                marginBottom: "0.25rem",
              }}
            >
              Price (optional)
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min={0}
              step={0.01}
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
              htmlFor="image_url"
              style={{
                display: "block",
                fontSize: "0.9rem",
                color: "#333",
                marginBottom: "0.25rem",
              }}
            >
              Image URL (optional)
            </label>
            <input
              type="url"
              id="image_url"
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
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
              htmlFor="category_id"
              style={{
                display: "block",
                fontSize: "0.9rem",
                color: "#333",
                marginBottom: "0.25rem",
              }}
            >
              Category
            </label>
            <select
              id="category_id"
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "1px solid #e0e0e0",
                fontSize: "0.9rem",
                color: "#333",
              }}
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
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
              {isLoading ? "Creating..." : "Create Listing"}
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
