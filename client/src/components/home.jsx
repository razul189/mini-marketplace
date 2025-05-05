import Navbar from "./navbar";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

/**
 * Home component for the application's landing page.
 */
export default function Home() {
  // State for listings, categories, loading, and errors
  const [listings, setListings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Handle URL query parameters
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategoryId = searchParams.get("category_id") || "";

  // Fetch listings and categories when component mounts or category changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch categories
        const categoriesResponse = await fetch(
          "http://localhost:5000/api/categories",
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (!categoriesResponse.ok) {
          throw new Error(
            `Failed to fetch categories: ${categoriesResponse.status}`
          );
        }
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);

        // Fetch listings (with optional category filter)
        const listingsUrl = selectedCategoryId
          ? `http://localhost:5000/api/listings?category_id=${selectedCategoryId}`
          : "http://localhost:5000/api/listings";
        const listingsResponse = await fetch(listingsUrl, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!listingsResponse.ok) {
          throw new Error(
            `Failed to fetch listings: ${listingsResponse.status}`
          );
        }
        const listingsData = await listingsResponse.json();
        setListings(listingsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedCategoryId]);

  // Handle category selection
  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    if (categoryId) {
      setSearchParams({ category_id: categoryId });
    } else {
      setSearchParams({});
    }
  };

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
          Loading listings...
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
          Welcome to Mini Marketplace
        </h1>
        <p
          style={{
            fontSize: "1rem",
            color: "#555",
            lineHeight: "1.5",
          }}
        >
          Explore our listings and categories to find what you need.
        </p>
        <h1
          style={{
            fontSize: "1.5rem",
            fontWeight: "600",
            color: "#333",
            margin: "0 0 1rem 0",
          }}
        >
          Listings
        </h1>
        <section
          style={{
            marginBottom: "1rem",
          }}
        >
          <label
            htmlFor="category-filter"
            style={{
              fontSize: "0.9rem",
              color: "#333",
              marginRight: "0.5rem",
            }}
          >
            Filter by Category
          </label>
          <select
            id="category-filter"
            value={selectedCategoryId}
            onChange={handleCategoryChange}
            style={{
              padding: "0.5rem",
              border: "1px solid #e0e0e0",
              fontSize: "0.9rem",
              color: "#333",
            }}
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </section>
        {listings.length === 0 ? (
          <p
            style={{
              fontSize: "0.9rem",
              color: "#333",
              margin: "0",
            }}
          >
            No listings available.
          </p>
        ) : (
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
            }}
          >
            {listings.map((listing) => (
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
                  Category: {listing.category?.name || "Unknown"}
                </p>
                <p
                  style={{
                    fontSize: "0.9rem",
                    color: "#333",
                    margin: "0.25rem 0",
                  }}
                >
                  Posted by: {listing.owner?.username || "Unknown"}
                </p>
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
      </main>
    </div>
  );
}