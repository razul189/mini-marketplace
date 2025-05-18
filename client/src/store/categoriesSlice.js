import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Thunk to fetch all categories from API
export const fetchCategories = createAsyncThunk(
  "categories/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("http://127.0.0.1:5000/api/categories", {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.status}`);
      }

      const data = await response.json();

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Thunk to fetch a single category by ID
export const fetchCategoryById = createAsyncThunk(
  "categories/fetchCategoryById",
  async ({ id, token }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/categories/${id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch category with ID ${id}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createCategory = createAsyncThunk(
  "categories/createCategory",
  async ({ name, token }, { rejectWithValue }) => {
    try {
      const response = await fetch("http://127.0.0.1:5000/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });

      if (response.status === 401 || response.status === 422) {
        return rejectWithValue("Unauthorized. Please login again.");
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || "Failed to create category");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Thunk to create a new listing
export const createListing = createAsyncThunk(
  "categories/createListing",
  async ({ formData, token }, { rejectWithValue }) => {
    try {
      const response = await fetch("http://127.0.0.1:5000/api/listings", {
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
const initialState = {
  categories: [],
  listings: [],
  // byId: {},
  // allIds: [],
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  selectedCategory: null,
};

// Categories Slice
const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    addCategories: (state, action) => {
      state.categories = action.payload;
      state.listings = action.payload.flatMap((category) => category.listings);
      // action.payload.forEach((category) => {
      //   state.byId[category.id] = category;
      //   if (!state.allIds.includes(category.id)) {
      //     state.allIds.push(category.id);
      //   }
      // });
    },
    removeCategory: (state, action) => {
      const id = action.payload;
      // delete state.byId[id];
      state.allIds = state.allIds.filter((catId) => catId !== id);
      state.categories = state.categories.filter((cat) => cat.id !== id);
    },
    clearCategory: (state) => {
      state.byId = {};
      state.allIds = [];
      state.categories = [];
      state.listings = [];
    },

    selectCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    deleteListing: (state, action) => {
      const id = action.payload;
      state.listings = state.listings.filter((listing) => listing.id !== id);
      state.categories = state.categories.map((category) => {
        return {
          ...category,
          listings: category.listings.filter((listing) => listing.id !== id),
        };
      });
    },
    updateListing: (state, action) => {
      const updatedListing = action.payload;
      state.listings = state.listings.map((listing) =>
        listing.id === updatedListing.id ? updatedListing : listing
      );
      state.categories = state.categories.map((category) => {
        return {
          ...category,
          listings: category.listings.map((listing) =>
            listing.id === updatedListing.id ? updatedListing : listing
          ),
        };
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.categories = action.payload;

        state.listings = action.payload.flatMap(
          (category) => category.listings
        );
        // action.payload.forEach((category) => {
        //   state.byId[category.id] = category;
        //   if (!state.allIds.includes(category.id)) {
        //     state.allIds.push(category.id);
        //   }
        // });
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to fetch categories.";
      })
      // HANDLE CREATE CATEGORY
      .addCase(createCategory.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.status = "succeeded";
        const category = action.payload;
        state.categories.push(category);
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to create category.";
      })
      // ADD LISTING
      .addCase(createListing.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(createListing.fulfilled, (state, action) => {
        state.status = "succeeded";
        const listing = action.payload;
        state.listings.push(listing);
        state.categories = state.categories.map((category) => {
          if (category.id === listing.category_id) {
            return {
              ...category,
              listings: [...category.listings, listing],
            };
          }
          return category;
        });
      })
      .addCase(createListing.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to create listing.";
      });
  },
});

export const {
  addCategories,
  selectCategory,
  removeCategory,
  clearCategory,
  updateListing,
  deleteListing,
} = categoriesSlice.actions;

export default categoriesSlice.reducer;
