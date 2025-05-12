import { createSlice } from "@reduxjs/toolkit";

const categoriesFromStorage = {
  byId: {},
  allIds: [],
};

const categoriesSlice = createSlice({
  name: "categories",
  initialState: categoriesFromStorage,
  reducers: {
    addCategories: (state, action) => {
      action.payload.forEach((category) => {
        state.byId[category.id] = category;
        if (state.allIds.length > 0 && !state.allIds.includes(category.id)) {
          state.allIds.push(category.id);
        }
      });
      localStorage.setItem("categories", JSON.stringify(state)); // Save to localStorage
    },
    removeCategory: (state, action) => {
      const id = action.payload;
      delete state.byId[id];
      state.allIds = state.allIds.filter((catId) => catId !== id);
      localStorage.setItem("categories", JSON.stringify(state)); // Save to localStorage
    },
    clearCategory: (state, action) => {
      state.byId = {};
      state.allIds = [];
    },
  },
});

export const { addCategories, removeCategory, clearCategory } =
  categoriesSlice.actions;
export default categoriesSlice.reducer;
