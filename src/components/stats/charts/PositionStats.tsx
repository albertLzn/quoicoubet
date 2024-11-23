import React from 'react';
import { Paper, Typography } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import { Hand } from '../../../types/hand';

interface PositionStatsProps {
  hands: Hand[];
}

const PositionStats: React.FC<PositionStatsProps> = ({ hands }) => {
  const positionData = hands.reduce((acc, hand) => {
    acc[hand.position] = (acc[hand.position] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const data = {
    labels: Object.keys(positionData),
    datasets: [
      {
        label: 'Mains par position',
        data: Object.values(positionData),
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6">Statistiques par position</Typography>
      <Bar data={data} />
    </Paper>
  );
};

export default PositionStats;