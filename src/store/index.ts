import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import challengesReducer from './slices/challengesSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    challenges: challengesReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 