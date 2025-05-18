import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { removeListing } from "./listingsSlice";
import { removeFavorite } from "./favoritesSlice";

export const deleteListingWithFavorites = createAsyncThunk(
  "myListings/deleteWithFavorites",
  async ({ listingId, token }, { dispatch, rejectWithValue }) => {
    try {
      const favRes = await fetch(
        `http://localhost:5000/api/favorites?item_listing_id=${listingId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (favRes.status === 401 || favRes.status === 422) {
        return rejectWithValue("Unauthorized");
      }

      if (!favRes.ok) throw new Error("Failed to fetch favorites");

      const favorites = await favRes.json();
      for (const fav of favorites) {
        const res = await fetch(
          `http://localhost:5000/api/favorites/${fav.id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.ok || res.status === 404) {
          dispatch(removeFavorite(fav.id));
        } else if (res.status === 401 || res.status === 422) {
          return rejectWithValue("Unauthorized");
        } else {
          throw new Error(`Failed to delete favorite ${fav.id}`);
        }
      }

      const delRes = await fetch(
        `http://localhost:5000/api/listings/${listingId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (delRes.ok) {
        dispatch(removeListing(listingId));
        return listingId;
      } else if (delRes.status === 403) {
        return rejectWithValue("Forbidden");
      } else if (delRes.status === 401 || delRes.status === 422) {
        return rejectWithValue("Unauthorized");
      }

      throw new Error("Failed to delete listing");
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Thunk to create a new listing
export const createListing = createAsyncThunk(
  "myListings/createListing",
  async ({ formData, token }, { rejectWithValue }) => {
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

      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Initial State
const myListingsFromStorage = {
  byId: {},
  allIds: [],
};

// Slice
const myListingsSlice = createSlice({
  name: "myListings",
  initialState: myListingsFromStorage,
  reducers: {
    addMyListings: (state, action) => {
      action.payload.forEach((listing) => {
        state.byId[listing.id] = listing;
        if (!state.allIds.includes(listing.id)) {
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
    clearMyListing: (state) => {
      state.byId = {};
      state.allIds = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createListing.fulfilled, (state, action) => {
        const listing = action.payload;
        state.byId[listing.id] = listing;
        if (!state.allIds.includes(listing.id)) {
          state.allIds.push(listing.id);
        }
      })
      .addCase(deleteListingWithFavorites.fulfilled, (state, action) => {
        const listingId = action.payload;
        delete state.byId[listingId];
        state.allIds = state.allIds.filter((id) => id !== listingId);
      });
  },
});

// Exports
export const {
  addMyListings,
  updateMyListing,
  removeMyListing,
  clearMyListing,
} = myListingsSlice.actions;

export default myListingsSlice.reducer;
