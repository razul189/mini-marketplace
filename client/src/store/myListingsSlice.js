import { createSlice } from "@reduxjs/toolkit";

const myListingsFromStorage = {
  byId: {},
  allIds: [],
};

const myListingsSlice = createSlice({
  name: "myListings",
  initialState: myListingsFromStorage,
  reducers: {
    addMyListings: (state, action) => {
      action.payload.forEach((listing) => {
        state.byId[listing.id] = listing;
        if (state.allIds.length > 0 && !state.allIds.includes(listing.id)) {
          state.allIds.push(listing.id);
        }
      });
    },
    updateMyListing: (state, action) => {
      const { id, ...updates } = action.payload;
      state.byId[id] = { ...state.byId[id], ...updates };
    },
    removeMyListing: (state, action) => {
      const id = action.payload;
      delete state.byId[id];
      state.allIds = state.allIds.filter((listId) => listId !== id);
    },
    clearMyListing: (state, action) => {
      state.byId = {};
      state.allIds = [];
    },
  },
});

export const {
  addMyListings,
  updateMyListing,
  removeMyListing,
  clearMyListing,
} = myListingsSlice.actions;
export default myListingsSlice.reducer;
