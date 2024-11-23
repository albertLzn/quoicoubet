import React from 'react';
import { Paper, Typography } from '@mui/material';
import { Pie } from 'react-chartjs-2';
import { Hand } from '../../../types/hand';

interface HandDistributionProps {
  hands: Hand[];
}

const HandDistribution: React.FC<HandDistributionProps> = ({ hands }) => {
  const distribution = hands.reduce((acc, hand) => {
    acc[hand.action] = (acc[hand.action] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const data = {
    labels: Object.keys(distribution),
    datasets: [
      {
        data: Object.values(distribution),
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
        ],
      },
    ],
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6">Distribution des actions</Typography>
      <Pie data={data} />
    </Paper>
  );
};

export default HandDistribution;