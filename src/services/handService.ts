import { ref, push, set, get, query, orderByChild } from 'firebase/database';
import { database } from '../config/firebase';
import { Hand } from '../types/hand';

export const handService = {
  saveHand: async (userId: string, hand: Omit<Hand, 'id'>) => {
    try {
      const handRef = push(ref(database, `hands/${userId}`));
      const handWithId = { ...hand, id: handRef.key };
      await set(handRef, handWithId);
      return handWithId;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      throw error;
    }
  },

  getUserHands: async (userId: string): Promise<Hand[]> => {
    try {
      const handsRef = query(
        ref(database, `hands/${userId}`),
        orderByChild('timestamp')
      );
      const snapshot = await get(handsRef);
      const hands = snapshot.val();
      return hands ? Object.values(hands) as Hand[] : [];
    } catch (error) {
      console.error('Erreur lors de la récupération:', error);
      throw error;
    }
  },

  updateHand: async (userId: string, handId: string, updates: Partial<Hand>) => {
    try {
      const handRef = ref(database, `hands/${userId}/${handId}`);
      await set(handRef, updates);
      return updates;
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      throw error;
    }
  },
};