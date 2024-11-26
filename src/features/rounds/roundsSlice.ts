// features/rounds/roundsSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PokerRound } from '../../types/hand';

interface RoundsState {
  rounds: PokerRound[];
  loading: boolean;
  error: string | null;
}

const initialState: RoundsState = {
  rounds: [],
  loading: false,
  error: null
};

const roundsSlice = createSlice({
  name: 'rounds',
  initialState,
  reducers: {
    addRound: (state, action: PayloadAction<PokerRound>) => {
      state.rounds.push(action.payload);
    },
    setRounds: (state, action: PayloadAction<PokerRound[]>) => {
      state.rounds = action.payload;
    },
    updateRound: (state, action: PayloadAction<PokerRound>) => {
      const index = state.rounds.findIndex(round => round.id === action.payload.id);
      if (index !== -1) {
        state.rounds[index] = action.payload;
      }
    }
  }
});

export const { addRound, setRounds, updateRound } = roundsSlice.actions;
export default roundsSlice.reducer;