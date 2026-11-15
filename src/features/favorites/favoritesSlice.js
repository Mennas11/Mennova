import { createSlice } from "@reduxjs/toolkit";

function load() {
  try {
    return JSON.parse(localStorage.getItem("favorites")) || [];
  } catch {
    return [];
  }
}

function save(items) {
  localStorage.setItem("favorites", JSON.stringify(items));
}

const favoritesSlice = createSlice({
  name: "favorites",
  initialState: load(),
  reducers: {
    // adds the product if it's not there, removes it if it is
    toggleFavorite: (state, action) => {
      const p = action.payload;
      const index = state.findIndex((item) => item.id === p.id);

      if (index >= 0) {
        state.splice(index, 1);
      } else {
        // keep only what the cards need
        state.push({
          id: p.id,
          title: p.title,
          price: p.price,
          thumbnail: p.thumbnail,
          category: p.category,
        });
      }
      save(state);
    },

    removeFromFavorites: (state, action) => {
      const updated = state.filter((item) => item.id !== action.payload);
      save(updated);
      return updated;
    },
  },
});

export const { toggleFavorite, removeFromFavorites } = favoritesSlice.actions;
export default favoritesSlice.reducer;