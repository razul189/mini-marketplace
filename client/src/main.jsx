import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  createBrowserRouter,
  Route,
  Routes,
  RouterProvider,
} from "react-router-dom";

import "./index.css";

import store from "./store/store.js";
import { Provider } from "react-redux";

import App from "./components/App.jsx";

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
    {/* <RouterProvider router={router} /> */}
  </Provider>
);