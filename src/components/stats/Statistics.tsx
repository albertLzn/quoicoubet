import React from 'react';
import { Box } from '@mui/material';
import AdvancedStats from './AdvancedStats';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

const Statistics: React.FC = () => {
  const hands = useSelector((state: RootState) => state.hands.hands);

  return (
    <Box sx={{ mt: 2 }}>
      <AdvancedStats hands={hands} />
    </Box>
  );
};

export default Statistics;