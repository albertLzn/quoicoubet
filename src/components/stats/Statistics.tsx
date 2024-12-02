import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, CircularProgress } from '@mui/material';
import AdvancedStats from './AdvancedStats';
import { RootState } from '../../store';
import { roundService } from '../../services/roundService';
import { setRounds } from '../../features/rounds/roundsSlice';

const Statistics: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const rounds = useSelector((state: RootState) => state.rounds.rounds);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRounds = async () => {
      if (user) {
        setIsLoading(true);
        try {
          const userRounds = await roundService.getUserRounds(user.uid);
          dispatch(setRounds(userRounds));
        } catch (error) {
          console.error('Erreur lors du chargement des rounds:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    loadRounds();
  }, [dispatch, user]);

  if (isLoading) {
    return <CircularProgress />;
  }

  return (
    <Box sx={{ mt: 2 }}>
      <AdvancedStats rounds={rounds} />
    </Box>
  );
};

export default Statistics;