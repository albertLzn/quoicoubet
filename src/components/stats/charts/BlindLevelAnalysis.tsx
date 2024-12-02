import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Paper, Typography } from '@mui/material';
import { PokerRound } from '../../../types/hand';

interface BlindLevelProps {
  rounds: PokerRound[];
}

interface BlindStats {
  profit: number;
  hands: number;
}

const BlindLevelAnalysis: React.FC<BlindLevelProps> = ({ rounds }) => {
  const calculateProfitByBlind = () => {
    return rounds.reduce((acc: Record<string, BlindStats>, round) => {
      const streets = Object.values(round.streets);
      const lastStreet = streets[streets.length - 1];
      
      if (!acc[round.blindLevel]) {
        acc[round.blindLevel] = { profit: 0, hands: 0 };
      }

      if (lastStreet) {
        acc[round.blindLevel].profit += lastStreet.result;
        acc[round.blindLevel].hands += 1;
      }

      return acc;
    }, {});
  };

  const blindStats = calculateProfitByBlind();

  const data = {
    labels: Object.keys(blindStats),
    datasets: [{
      label: 'Profit par niveau de blinds (BB)',
      data: Object.values(blindStats).map(stats => stats.profit),
      backgroundColor: 'rgba(53, 162, 235, 0.5)',
      borderColor: 'rgb(53, 162, 235)',
      borderWidth: 1
    }]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const
      },
      title: {
        display: true,
        text: 'Analyse par Niveau de Blinds'
      }
    },
    scales: {
      y: {
        type: 'linear' as const,
        beginAtZero: true
      }
    }
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
        Analyse par Niveau de Blinds
      </Typography>
      <Bar data={data} options={options} />
    </Paper>
  );
};

export default BlindLevelAnalysis;