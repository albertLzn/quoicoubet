import React from 'react';
import { Paper, Typography } from '@mui/material';
import { Pie } from 'react-chartjs-2';
import { PokerRound } from '../../../types/hand';

interface HandDistributionProps {
  rounds: PokerRound[];
}

const HandDistribution: React.FC<HandDistributionProps> = ({ rounds }) => {
  const distribution = rounds.reduce((acc: Record<string, number>, round) => {
    // Prendre la dernière action du round
    const streets = Object.values(round.streets);
    const lastStreet = streets[streets.length - 1];
    
    if (lastStreet) {
      acc[lastStreet.action] = (acc[lastStreet.action] || 0) + 1;
    }
    return acc;
  }, {});

  const data = {
    labels: Object.keys(distribution),
    datasets: [
      {
        data: Object.values(distribution),
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',  // fold
          'rgba(54, 162, 235, 0.5)',   // call
          'rgba(255, 206, 86, 0.5)',   // raise
          'rgba(75, 192, 192, 0.5)',   // bet
          'rgba(153, 102, 255, 0.5)',  // check
        ],
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Distribution des actions',
      },
    },
  };
  if (rounds.length === 0) {
    return (
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Pas de données disponibles
        </Typography>
      </Paper>
    );
  }
  

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Distribution des actions
      </Typography>
      <Pie data={data} options={options} />
    </Paper>
  );
};

export default HandDistribution;