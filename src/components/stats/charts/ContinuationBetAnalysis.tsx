import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Paper, Typography } from '@mui/material';
import { PokerRound } from '../../../types/hand';

interface CBetProps {
  rounds: PokerRound[];
}

interface CBetStats {
  attempted: number;
  successful: number;
}

const ContinuationBetAnalysis: React.FC<CBetProps> = ({ rounds }) => {
  const calculateCBetEfficiency = (): CBetStats => {
    return rounds.reduce((acc: CBetStats, round) => {
      const streets = Object.values(round.streets);
      const flopStreet = streets.find(street => street.isCBet);
      
      if (flopStreet) {
        acc.attempted++;
        const lastStreet = streets[streets.length - 1];
        if (lastStreet && lastStreet.result > 0) {
          acc.successful++;
        }
      }
      
      return acc;
    }, {
      attempted: 0,
      successful: 0
    });
  };

  const stats = calculateCBetEfficiency();
  const successRate = stats.attempted > 0 
    ? (stats.successful / stats.attempted) * 100 
    : 0;

  const data = {
    labels: ['C-Bets Tentés', 'C-Bets Réussis'],
    datasets: [{
      label: 'Statistiques C-Bet',
      data: [stats.attempted, stats.successful],
      backgroundColor: [
        'rgba(54, 162, 235, 0.5)',
        'rgba(75, 192, 192, 0.5)'
      ],
      borderColor: [
        'rgb(54, 162, 235)',
        'rgb(75, 192, 192)'
      ],
      borderWidth: 1
    }]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `Efficacité des C-Bets (${successRate.toFixed(1)}%)`
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
        Analyse des C-Bets
      </Typography>
      <Bar data={data} options={options} />
    </Paper>
  );
};

export default ContinuationBetAnalysis;