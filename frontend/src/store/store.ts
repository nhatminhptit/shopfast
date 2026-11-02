import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./cartSlice";
import { CART_STORAGE_KEY } from "./cartSlice";

export const store = configureStore({
  reducer: {
    cart: cartReducer,
  },
});

store.subscribe(() => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const { cartsByUser } = store.getState().cart;
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartsByUser));
  } catch (error) {
    console.error("Không thể lưu giỏ hàng:", error);
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
