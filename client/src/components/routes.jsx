import { createBrowserRouter } from "react-router-dom";

import Home from "./home.jsx";
import Listings from "./listings.jsx";
import Listing from "./listing.jsx";
import Dashboard from "./dashboard.jsx";
import Login from "./login.jsx";
import Signup from "./signup.jsx";
import MyCategories from "./my_categories.jsx";
import CategoryListings from "./category_listings.jsx";

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

export default router;
