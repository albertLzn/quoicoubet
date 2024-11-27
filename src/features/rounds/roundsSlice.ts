
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { PokerRound } from '../../types/hand';
import { database } from '../../config/firebase';
import { ref, get } from 'firebase/database';

interface RoundsState {
  rounds: PokerRound[];
  loading: boolean;
  error: string | null;
}


export const fetchRounds = createAsyncThunk(
  'rounds/fetchRounds',
  async (userId: string) => {
    const roundsRef = ref(database, `rounds/${userId}`);
    const snapshot = await get(roundsRef);
    if (snapshot.exists()) {
      const rounds = Object.entries(snapshot.val()).map(([key, data]) => ({
        ...data as PokerRound,
        id: key
      }));
      return rounds;
    }
    return [];
  }
);

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