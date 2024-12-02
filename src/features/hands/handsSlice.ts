import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Hand } from '../../types/hand';

interface HandsState {
  hands: Hand[];
  currentHand: Hand | null;
  loading: boolean;
  error: string | null;
}

const initialState: HandsState = {
  hands: [],
  currentHand: null,
  loading: false,
  error: null,
};

const handsSlice = createSlice({
  name: 'hands',
  initialState,
  reducers: {
    setHands: (state, action: PayloadAction<Hand[]>) => {
      state.hands = action.payload;
    },
    addHand: (state, action: PayloadAction<Hand>) => {
      state.hands.push(action.payload);
    },
    setCurrentHand: (state, action: PayloadAction<Hand | null>) => {
      state.currentHand = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setHands, addHand, setCurrentHand, setLoading, setError } = handsSlice.actions;
export default handsSlice.reducer;