import { createSlice } from "@reduxjs/toolkit";

function load() {
  try {
    return JSON.parse(localStorage.getItem("cart")) || [];
  } catch {
    return [];
  }
}

function save(items) {
  localStorage.setItem("cart", JSON.stringify(items));
}

// The same shirt in M and in L are two different lines in the bag,
// so every line has its own cartId = productId + size.
export const makeCartId = (id, size) => `${id}-${size || "one"}`;

const cartSlice = createSlice({
  name: "cart",
  initialState: load(),
  reducers: {
    // payload: { id, title, price, thumbnail, size? }
    addToCart: (state, action) => {
      const p = action.payload;
      const cartId = makeCartId(p.id, p.size);
      const existing = state.find((item) => item.cartId === cartId);

      if (existing) {
        existing.quantity += 1;
      } else {
        state.push({
          cartId,
          id: p.id,
          title: p.title,
          price: p.price,
          thumbnail: p.thumbnail,
          size: p.size || null,
          quantity: 1,
        });
      }
      save(state);
    },

    increaseQuantity: (state, action) => {
      const item = state.find((i) => i.cartId === action.payload);
      if (item) item.quantity += 1;
      save(state);
    },

    decreaseQuantity: (state, action) => {
      const item = state.find((i) => i.cartId === action.payload);
      if (item && item.quantity > 1) item.quantity -= 1;
      save(state);
    },

    removeFromCart: (state, action) => {
      const updated = state.filter((i) => i.cartId !== action.payload);
      save(updated);
      return updated;
    },

    clearCart: () => {
      localStorage.removeItem("cart");
      return [];
    },
  },
});

export const {
  addToCart,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;