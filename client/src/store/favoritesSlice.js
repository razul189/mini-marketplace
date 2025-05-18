import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

// Add this thunk above favoritesSlice
export const fetchFavorites = createAsyncThunk(
  "favorites/fetchAll",
  async (_, { getState, rejectWithValue }) => {
    const token = getState().auth.token;
    if (!token) return [];

    try {
      const res = await fetch(`http://127.0.0.1:5000/api/favorites`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 422) return [];
        throw new Error("Failed to fetch favorites");
      }

      return await res.json();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Add the following thunks to handle the additional logic

// Toggle favorite status
export const toggleFavorite = createAsyncThunk(
  "favorites/toggleFavorite",
  async ({ id, note, token, isFavorited }, { getState, rejectWithValue }) => {
    try {
      let response;

      if (isFavorited) {
        // Remove favorite
        const favorite = Object.values(getState().favorites.byId).find(
          (fav) => fav.item_listing_id === id
        );
        if (favorite) {
          response = await fetch(
            `http://localhost:5000/api/favorites/${favorite.id}`,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );
        }
      } else {
        // Add new favorite with note
        response = await fetch("http://localhost:5000/api/favorites", {
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
      }

      if (!response.ok) {
        throw new Error("Failed to update favorite status");
      }

      return await response.json();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateFavoriteNote = createAsyncThunk(
  "favorites/updateNote",
  async ({ id, item_listing_id, note }, { getState, rejectWithValue }) => {
    const token = getState().auth.token;
    try {
      const response = await fetch(
        `http://localhost:5000/api/favorites/${id}`,
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

// Fetch a specific favorite status for a listing
export const fetchFavoriteStatus = createAsyncThunk(
  "favorites/fetchFavoriteStatus",
  async ({ id, token }, { getState, rejectWithValue }) => {
    try {
      const res = await fetch(`http://localhost:5000/api/favorites`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch favorite status");
      }

      const favorites = await res.json();
      const favorite = favorites.find((fav) => fav.item_listing_id === id);

      return favorite || null;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

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
  extraReducers: (builder) => {
    builder
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        action.payload.forEach((favorite) => {
          state.byId[favorite.id] = favorite;
          if (!state.allIds.includes(favorite.id)) {
            state.allIds.push(favorite.id);
          }
        });
        localStorage.setItem("favorites", JSON.stringify(state));
      })
      .addCase(fetchFavorites.rejected, (state, action) => {
        console.error("Failed to fetch favorites:", action.payload);
      })
      .addCase(updateFavoriteNote.fulfilled, (state, action) => {
        const updatedFavorite = action.payload;
        if (updatedFavorite) {
          state.byId[updatedFavorite.id] = updatedFavorite;
          if (!state.allIds.includes(updatedFavorite.id)) {
            state.allIds.push(updatedFavorite.id);
          }
          localStorage.setItem("favorites", JSON.stringify(state));
        }
      })
      .addCase(updateFavoriteNote.rejected, (state, action) => {
        console.error("Failed to update note:", action.payload);
      });
  },
});

export const { addFavorites, removeFavorite, clearFavorite } =
  favoritesSlice.actions;
export default favoritesSlice.reducer;
