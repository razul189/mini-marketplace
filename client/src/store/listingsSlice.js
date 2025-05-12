import { createSlice } from "@reduxjs/toolkit";

const listingsFromStorage = {
  byId: {},
  allIds: [],
};

const listingsSlice = createSlice({
  name: "listings",
  initialState: listingsFromStorage,
  reducers: {
    addListings: (state, action) => {
      action.payload.forEach((listing) => {
        state.byId[listing.id] = listing;
        if (state.allIds.length > 0 && !state.allIds.includes(listing.id)) {
          state.allIds.push(listing.id);
        }
      });
    },
    updateListing: (state, action) => {
      const { id, ...updates } = action.payload;
      state.byId[id] = { ...state.byId[id], ...updates };
      //localStorage.setItem("myListings", JSON.stringify(state)); // Save to localStorage
    },
    removeListing: (state, action) => {
      const id = action.payload;
      delete state.byId[id];
      state.allIds = state.allIds.filter((listId) => listId !== id);
    },
    clearListing: (state, action) => {
      state.byId = {};
      state.allIds = [];
    },
  },
});

export const { addListings, removeListing, updateListing, clearListing } =
  listingsSlice.actions;
export default listingsSlice.reducer;
