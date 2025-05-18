import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const tokenFromStorage = localStorage.getItem("token");

export const fetchUser = createAsyncThunk(
  "auth/fetchUser",
  async (_, { getState, rejectWithValue }) => {
    const token = getState().auth.token;
    try {
      const response = await fetch("http://127.0.0.1:5000/api/me", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401 || response.status === 422) {
        return rejectWithValue("Unauthorized or Unprocessable Entity");
      }

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const data = await response.json();
      return data; // Return the user data
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteMyListing = createAsyncThunk(
  "auth/deleteMyListing",
  async ({ listingId, token }, { dispatch, rejectWithValue }) => {
    try {
      const delRes = await fetch(
        `http://127.0.0.1:5000/api/listings/${listingId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (delRes.ok) {
        console.log("delRes", delRes);
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

export const updateMyListing = createAsyncThunk(
  "auth/updateMyListing",
  async ({ listing, token }, { rejectWithValue }) => {
    try {
      const res = await fetch(
        `http://127.0.0.1:5000/api/listings/${listing.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: listing.title,
            description: listing.description,
            price: listing.price,
            category_id: listing.category?.id,
            user_id: listing.user_id,
          }),
        }
      );

      if (!res.ok) {
        const error = await res.text();
        return rejectWithValue(error || "Failed to update listing");
      }

      return await res.json();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const toggleFavorite = createAsyncThunk(
  "auth/toggleFavorite",
  async ({ id, note, token, isFavorited }, { getState, rejectWithValue }) => {
    try {
      if (isFavorited) {
        // Remove favorite
        // const favorite = Object.values(getState().favorites.byId).find(
        //   (fav) => fav.item_listing_id === id
        // );
        const myFavorites = getState().auth.myFavorites;

        const favorite = myFavorites.find(
          (fav) => fav.item_listing_id === Number(id)
        );
        // console.log("Toggle Favorite:", id, note, token, isFavorited);
        // console.log("Favorite:", favorite);

        if (favorite) {
          const response = await fetch(
            `http://127.0.0.1:5000/api/favorites/${favorite.id}`,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!response.ok) {
            const error = await response.text();
            return rejectWithValue(error || "Failed to delete favorite");
          }

          return {
            status: "deleted",
            id: favorite.id,
          };
        }
      } else {
        // Add new favorite with note
        const response = await fetch("http://127.0.0.1:5000/api/favorites", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            item_listing_id: id,
            note: note.trim() || null,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to update favorite status");
        }
        const data = await response.json();

        if (data) {
          return data;
        } else {
          console.log("data", data);

          throw new Error("Failed to update favorite status");
        }
      }
    } catch (err) {
      console.log("err", err.message);
      return rejectWithValue(err.message);
    }
  }
);

export const updateFavoriteNote = createAsyncThunk(
  "auth/updateNote",
  async ({ id, item_listing_id, note }, { getState, rejectWithValue }) => {
    const token = getState().auth.token;
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/api/favorites/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ item_listing_id, note }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update note");
      }

      return await response.json();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: tokenFromStorage || null,
    isAuthenticated: !!tokenFromStorage,
    user: null,
    myListings: [],
    myCategories: [],
    myFavorites: [],
  },
  reducers: {
    loginSuccess: (state, action) => {
      state.token = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem("token", action.payload);
    },
    logout: (state) => {
      state.token = null;
      state.isAuthenticated = false;
      state.user = null;
      localStorage.removeItem("token");
    },
    addToMyListings: (state, action) => {
      const newListing = action.payload;
      state.myListings.push(newListing);

      // Check if the category exists
      const existingCategory = state.myCategories.find(
        (category) => category.id === newListing.category_id
      );

      if (existingCategory) {
        // If the category exists, add the listing to it
        // Add the listing to the existing category
        state.myCategories = state.myCategories.map((category) => {
          if (category.id === newListing.category_id) {
            return {
              ...category,
              listings: [...category.listings, newListing],
            };
          }
          return category;
        });
      } else {
        // Create a new category and add the listing to it
        const newCategory = {
          id: newListing.category_id,
          name: newListing.category?.name, // Use the category name if available
          listings: [newListing],
        };
        state.myCategories.push(newCategory);
      }
    },
    addToMyCategories: (state, action) => {
      const newCategory = action.payload;
      state.myCategories.push(newCategory);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.myCategories = action.payload.categories;
        state.myListings = action.payload.categories.flatMap(
          (category) => category.listings
        );
        state.myFavorites = action.payload.favorites;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteMyListing.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMyListing.fulfilled, (state, action) => {
        state.loading = false;
        const listingId = action.payload;
        state.myListings = state.myListings.filter(
          (listing) => listing.id !== listingId
        );
        state.myCategories.forEach((category) => {
          category.listings = category.listings.filter(
            (listing) => listing.id !== listingId
          );
        });

        // Optionally, you can also remove the category if it has no listings left
        state.myCategories = state.myCategories.filter(
          (category) => category.listings.length > 0
        );
      })
      .addCase(deleteMyListing.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateMyListing.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMyListing.fulfilled, (state, action) => {
        state.loading = false;
        const updatedListing = action.payload;
        state.myListings = state.myListings.map((listing) =>
          listing.id === updatedListing.id ? updatedListing : listing
        );

        // Update the category if it exists
        state.myCategories = state.myCategories.map((category) => {
          if (category.id === updatedListing.category_id) {
            return {
              ...category,
              listings: category.listings.map((listing) =>
                listing.id === updatedListing.id ? updatedListing : listing
              ),
            };
          }
          return category;
        });
      })
      .addCase(updateMyListing.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(toggleFavorite.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        state.loading = false;

        if (action.payload.status === "deleted") {
          const deletedFavoriteId = action.payload.id;
          state.myFavorites = state.myFavorites.filter(
            (fav) => fav.id !== deletedFavoriteId
          );
        } else {
          // Add new favorite
          const newFavorite = action.payload;
          console.log("newFavorite", newFavorite);

          state.myFavorites.push(newFavorite);
        }

        // const updatedFavorite = action.payload;
        // console.log("updatedFavorite", updatedFavorite);

        // if (updatedFavorite) {
        //   const existingFavoriteIndex = state.myFavorites.findIndex(
        //     (fav) => fav.id === updatedFavorite.id
        //   );

        //   if (existingFavoriteIndex !== -1) {
        //     // Update existing favorite
        //     state.myFavorites[existingFavoriteIndex] = updatedFavorite;
        //   } else {
        //     // Add new favorite
        //     state.myFavorites.push(updatedFavorite);
        //   }
        // }
      })
      .addCase(toggleFavorite.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateFavoriteNote.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateFavoriteNote.fulfilled, (state, action) => {
        state.loading = false;
        const updatedFavorite = action.payload;
        console.log("updatedFavorite", updatedFavorite);

        if (updatedFavorite) {
          const existingFavoriteIndex = state.myFavorites.findIndex(
            (fav) => fav.id === updatedFavorite.id
          );

          if (existingFavoriteIndex !== -1) {
            // Update existing favorite
            state.myFavorites[existingFavoriteIndex] = updatedFavorite;
          }
        }
      })
      .addCase(updateFavoriteNote.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  loginSuccess,
  logout,
  setUser,
  addToMyListings,
  addToMyCategories,
} = authSlice.actions;
export default authSlice.reducer;
