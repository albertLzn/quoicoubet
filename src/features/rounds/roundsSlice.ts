// features/rounds/roundsSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PokerRound } from '../../types/hand';

const roundsSlice = createSlice({
  name: 'rounds',
  initialState: {
    rounds: [] as PokerRound[]
  },
  reducers: {
    addRound: (state, action: PayloadAction<PokerRound>) => {
      state.rounds.push(action.payload);
    }
  }
});

export const { addRound } = roundsSlice.actions;
export default roundsSlice.reducer;