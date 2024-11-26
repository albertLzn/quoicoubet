// services/roundService.ts
import { ref, push, set, get, query, orderByChild } from 'firebase/database';
import { database } from '../config/firebase';
import { PokerRound } from '../types/hand';

export const roundService = {
  saveRound: async (userId: string, round: Omit<PokerRound, 'id'>) => {
    try {
      const roundRef = push(ref(database, `rounds/${userId}`));
      const roundWithId = { ...round, id: roundRef.key };
      await set(roundRef, roundWithId);
      return roundWithId;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      throw error;
    }
  },

  getUserRounds: async (userId: string): Promise<PokerRound[]> => {
    try {
      const roundsRef = query(
        ref(database, `rounds/${userId}`),
        orderByChild('timestamp')
      );
      const snapshot = await get(roundsRef);
      const rounds = snapshot.val();
      return rounds ? Object.values(rounds) as PokerRound[] : [];
    } catch (error) {
      console.error('Erreur lors de la récupération:', error);
      throw error;
    }
  },

  updateRound: async (userId: string, roundId: string, updates: Partial<PokerRound>) => {
    try {
      const roundRef = ref(database, `rounds/${userId}/${roundId}`);
      await set(roundRef, updates);
      return updates;
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      throw error;
    }
  },
};