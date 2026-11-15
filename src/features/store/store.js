import { configureStore } from "@reduxjs/toolkit";

import favoritesReducer from "../favorites/favoritesSlice";
import cartReducer from "../cart/cartSlice";
import authReducer from "../auth/authSlice";
import wardrobeReducer from "../wardrobe/wardrobeSlice";
import quizReducer from "../quiz/quizSlice";
import themeReducer from "../Theme/themeSlice";
const store = configureStore({
  reducer: {
    favorites: favoritesReducer,
    cart: cartReducer,
    auth: authReducer,
    wardrobe: wardrobeReducer,
    quiz: quizReducer,
    theme: themeReducer,
  },
});

export default store;