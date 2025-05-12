import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import categoriesReducer from "./categoriesSlice";
import listingsReducer from "./listingsSlice";
import favoritesReducer from "./favoritesSlice";
import myListingsReducer from "./myListingsSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    categories: categoriesReducer,
    listings: listingsReducer,
    favorites: favoritesReducer,
    myListings: myListingsReducer,
  },
});

export default store;
