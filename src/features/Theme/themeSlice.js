import { createSlice } from "@reduxjs/toolkit";

const KEY = "mennovaTheme";

function initialMode() {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    // storage blocked: fall back to the brand default
  }
  return "dark"; // Mennova's default look
}

function save(mode) {
  try {
    localStorage.setItem(KEY, mode);
  } catch {
    // ignore
  }
}

const themeSlice = createSlice({
  name: "theme",
  initialState: { mode: initialMode() },
  reducers: {
    toggleTheme: (state) => {
      state.mode = state.mode === "dark" ? "light" : "dark";
      save(state.mode);
    },
    setTheme: (state, action) => {
      state.mode = action.payload;
      save(state.mode);
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;