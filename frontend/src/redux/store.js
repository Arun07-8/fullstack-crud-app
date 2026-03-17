import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../../features/auth/authReducer.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});