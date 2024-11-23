import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box } from '@mui/material';
import AdvancedStats from './AdvancedStats';
import { RootState } from '../../store';
import { handService } from '../../services/handService';
import { setHands } from '../../features/hands/handsSlice';

const Statistics: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const hands = useSelector((state: RootState) => state.hands.hands);

  useEffect(() => {
    const loadHands = async () => {
      if (user) {
        try {
          const userHands = await handService.getUserHands(user.uid);
          dispatch(setHands(userHands));
        } catch (error) {
          console.error('Erreur lors du chargement des mains:', error);
        }
      }
    };

    loadHands();
  }, [dispatch, user]);

  return (
    <Box sx={{ mt: 2 }}>
      <AdvancedStats hands={hands} />
    </Box>
  );
};

export default Statistics;