import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface StatsState {
  totalHands: number;
  winRate: number;
  bbPer100: number;
  vpip: number;
  pfr: number;
  loading: boolean;
}

const initialState: StatsState = {
  totalHands: 0,
  winRate: 0,
  bbPer100: 0,
  vpip: 0,
  pfr: 0,
  loading: false,
};

const statsSlice = createSlice({
  name: 'stats',
  initialState,
  reducers: {
    updateStats: (state, action: PayloadAction<Partial<StatsState>>) => {
      return { ...state, ...action.payload };
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { updateStats, setLoading } = statsSlice.actions;
export default statsSlice.reducer;