import { createSlice } from "@reduxjs/toolkit";

const favoritesFromStorage = {
  byId: {},
  allIds: [],
};

const favoritesSlice = createSlice({
  name: "favorites",
  initialState: favoritesFromStorage,
  reducers: {
    addFavorites: (state, action) => {
      action.payload.forEach((favorite) => {
        state.byId[favorite.id] = favorite;
        if (state.allIds.length > 0 && !state.allIds.includes(favorite.id)) {
          state.allIds.push(favorite.id);
        }
      });
      localStorage.setItem("favorites", JSON.stringify(state)); // Save to localStorage
    },
    removeFavorite: (state, action) => {
      const id = action.payload;
      delete state.byId[id];
      state.allIds = state.allIds.filter((favId) => favId !== id);
      localStorage.setItem("favorites", JSON.stringify(state)); // Save to localStorage
    },
    clearFavorite: (state, action) => {
      state.byId = {};
      state.allIds = [];
    },
  },
});

export const { addFavorites, removeFavorite, clearFavorite } =
  favoritesSlice.actions;
export default favoritesSlice.reducer;
