import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// At the top of listingsSlice.js
export const fetchListingById = createAsyncThunk(
  "listings/fetchById",
  async ({ id }, { getState, rejectWithValue }) => {
    const cached = getState().listings.byId[id];
    if (cached) return cached;

    try {
      const res = await fetch(`http://127.0.0.1:5000/api/listings/${id}`, {
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        if (res.status === 404) throw new Error("Listing not found");
        throw new Error(`Failed to fetch listing: ${res.status}`);
      }
      return await res.json();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Async Thunk: Fetch listings from API
export const fetchListings = createAsyncThunk(
  "listings/fetchListings",
  async (categoryId = "", { rejectWithValue }) => {
    try {
      const url = categoryId
        ? `http://127.0.0.1:5000/api/listings?category_id=${categoryId}`
        : `http://127.0.0.1:5000/api/listings`;
      const response = await fetch(url, {
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch listings: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  byId: {},
  allIds: [],
  isLoading: false,
  error: null,
};

const listingsSlice = createSlice({
  name: "listings",
  initialState,
  reducers: {
    addListings: (state, action) => {
      action.payload.forEach((listing) => {
        state.byId[listing.id] = listing;
        if (!state.allIds.includes(listing.id)) {
          state.allIds.push(listing.id);
        }
      });
    },
    updateListing: (state, action) => {
      const { id, ...updates } = action.payload;
      if (state.byId[id]) {
        state.byId[id] = { ...state.byId[id], ...updates };
      }
    },
    removeListing: (state, action) => {
      const id = action.payload;
      delete state.byId[id];
      state.allIds = state.allIds.filter((listId) => listId !== id);
    },
    clearListing: (state) => {
      state.byId = {};
      state.allIds = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchListings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchListings.fulfilled, (state, action) => {
        state.isLoading = false;
        // Reuse addListings logic here
        action.payload.forEach((listing) => {
          state.byId[listing.id] = listing;
          if (!state.allIds.includes(listing.id)) {
            state.allIds.push(listing.id);
          }
        });
      })
      .addCase(fetchListings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { addListings, removeListing, updateListing, clearListing } =
  listingsSlice.actions;

export default listingsSlice.reducer;
