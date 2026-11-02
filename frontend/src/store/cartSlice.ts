import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface CartState {
  cartsByUser: Record<string, CartItem[]>;
  currentEmail: string | null;
}

export const CART_STORAGE_KEY = "shopfast-carts";

function loadPersistedCarts(): Record<string, CartItem[]> {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const persistedCarts = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!persistedCarts) {
      return {};
    }

    const parsedCarts = JSON.parse(persistedCarts) as Record<
      string,
      CartItem[]
    >;
    return parsedCarts && typeof parsedCarts === "object" ? parsedCarts : {};
  } catch (error) {
    console.error("Không thể đọc giỏ hàng đã lưu:", error);
    return {};
  }
}

const initialState: CartState = {
  cartsByUser: loadPersistedCarts(),
  currentEmail: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCurrentUser: (state, action: PayloadAction<string>) => {
      state.currentEmail = action.payload;
      state.cartsByUser[action.payload] ??= [];
    },
    addItem: (state, action: PayloadAction<Product>) => {
      if (!state.currentEmail) return;

      const currentItems = state.cartsByUser[state.currentEmail] ?? [];
      const existingItem = currentItems.find(
        (item) => item.id === action.payload.id,
      );

      if (existingItem) {
        existingItem.quantity += 1;
        return;
      }

      currentItems.push({ ...action.payload, quantity: 1 });
      state.cartsByUser[state.currentEmail] = currentItems;
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ id: string; quantity: number }>,
    ) => {
      if (!state.currentEmail) return;

      const currentItems = state.cartsByUser[state.currentEmail] ?? [];
      const item = currentItems.find(
        (cartItem) => cartItem.id === action.payload.id,
      );

      if (!item) {
        return;
      }

      if (action.payload.quantity <= 0) {
        state.cartsByUser[state.currentEmail] = currentItems.filter(
          (cartItem) => cartItem.id !== action.payload.id,
        );
        return;
      }

      item.quantity = action.payload.quantity;
    },
    removeItem: (state, action: PayloadAction<string>) => {
      if (!state.currentEmail) return;

      const currentItems = state.cartsByUser[state.currentEmail] ?? [];
      state.cartsByUser[state.currentEmail] = currentItems.filter(
        (item) => item.id !== action.payload,
      );
    },
    clearCart: (state) => {
      state.currentEmail = null;
    },
  },
});

export const {
  addItem,
  updateQuantity,
  removeItem,
  clearCart,
  setCurrentUser,
} =
  cartSlice.actions;

const selectCurrentCart = (state: { cart: CartState }): CartItem[] => {
  const { currentEmail, cartsByUser } = state.cart;
  return currentEmail ? (cartsByUser[currentEmail] ?? []) : [];
};

export const selectCartItems = (state: { cart: CartState }): CartItem[] =>
  selectCurrentCart(state);

export const selectCartItemCount = (state: { cart: CartState }): number =>
  selectCurrentCart(state).reduce((total, item) => total + item.quantity, 0);

export const selectCartTotal = (state: { cart: CartState }): number =>
  selectCurrentCart(state).reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

export default cartSlice.reducer;
