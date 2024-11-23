import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { handService } from '../services/handService';
import { addHand, setHands } from '../features/hands/handsSlice';
import { Hand } from '../types/hand';

export const useHandManager = (userId: string) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadHands = async () => {
      try {
        const hands = await handService.getUserHands(userId);
        dispatch(setHands(hands as Hand[]));
      } catch (err) {
        setError('Erreur lors du chargement des mains');
      } finally {
        setLoading(false);
      }
    };

    loadHands();
  }, [userId, dispatch]);

  const saveNewHand = async (handData: Omit<Hand, 'id'>) => {
    try {
      const savedHand = await handService.saveHand(userId, handData);
      if (savedHand.id) {
        dispatch(addHand(savedHand as Hand));
        return savedHand as Hand;
      }
      throw new Error('Hand ID is missing');
    } catch (err) {
      setError('Erreur lors de la sauvegarde de la main');
      throw err;
    }
  };

  return { loading, error, saveNewHand };
};