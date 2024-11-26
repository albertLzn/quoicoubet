import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { roundService } from '../services/roundService';
import { Hand, PokerRound } from '../types/hand';
import { addRound, setRounds } from '../features/rounds/roundsSlice';

export const useHandManager = (userId: string) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadHands = async () => {
      try {
        const rounds = await roundService.getUserRounds(userId);
        dispatch(setRounds(rounds as PokerRound[]));
      } catch (err) {
        setError('Erreur lors du chargement des mains');
      } finally {
        setLoading(false);
      }
    };

    loadHands();
  }, [userId, dispatch]);

  const saveNewHand = async (roundData: Omit<PokerRound, 'id'>) => {
    try {
      const savedRound = await roundService.saveRound(userId, roundData);
      if (savedRound.id) {
        dispatch(addRound(savedRound as PokerRound));
        return savedRound as PokerRound;
      }
      throw new Error('Hand ID is missing');
    } catch (err) {
      setError('Erreur lors de la sauvegarde de la main');
      throw err;
    }
  };

  return { loading, error, saveNewHand };
};