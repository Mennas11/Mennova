import { createSlice } from "@reduxjs/toolkit";

function load() {
  try {
    return JSON.parse(localStorage.getItem("wardrobe")) || [];
  } catch {
    return [];
  }
}

function save(items) {
  try {
    localStorage.setItem("wardrobe", JSON.stringify(items));
  } catch {
    // storage full: items stay in memory for this session
  }
}

const wardrobeSlice = createSlice({
  name: "wardrobe",
  initialState: load(),
  reducers: {
    addWardrobeItem: (state, action) => {
      state.unshift(action.payload);
      save(state);
    },
    removeWardrobeItem: (state, action) => {
      const updated = state.filter((item) => item.id !== action.payload);
      save(updated);
      return updated;
    },
  },
});

export const { addWardrobeItem, removeWardrobeItem } = wardrobeSlice.actions;
export default wardrobeSlice.reducer;