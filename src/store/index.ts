import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import handsReducer from '../features/hands/handsSlice';
import statsReducer from '../features/stats/statsSlice';
import roundsReducer from '../features/rounds/roundsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    hands: handsReducer,
    rounds: roundsReducer,
    stats: statsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;