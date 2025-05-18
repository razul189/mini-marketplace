import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import "./index.css";

import store from "./store/store.js";
import { Provider } from "react-redux";

import Home from "./components/home.jsx";
import Listings from "./components/listings.jsx";
import Listing from "./components/listing.jsx";
import Dashboard from "./components/dashboard.jsx";
import Login from "./components/login.jsx";
import Signup from "./components/signup.jsx";
import MyCategories from "./components/my_categories.jsx";
import CategoryListings from "./components/category_listings.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/listings",
    element: <Listings />,
  },
  {
    path: "/listings/:id",
    element: <Listing />,
  },
  {
    path: "/my-categories",
    element: <MyCategories />,
  },
  {
    path: "/category-listings/:id",
    element: <CategoryListings />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
]);

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <RouterProvider router={router} />
  </Provider>
);