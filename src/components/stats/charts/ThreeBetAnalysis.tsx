import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Paper, Typography } from '@mui/material';
import '../../../config/chartConfig';
import { PokerRound } from '../../../types/hand';

interface ThreeBetProps {
  rounds: PokerRound[];
}

interface ThreeBetStats {
  total3Bets: number;
  successful3Bets: number;
  fold3Bets: number;
}

const ThreeBetAnalysis: React.FC<ThreeBetProps> = ({ rounds }) => {
  const calculate3BetStats = (): ThreeBetStats => {
    return rounds.reduce((stats: ThreeBetStats, round) => {
      const streets = Object.values(round.streets);
      const preflopStreet = streets.find(street => street.isThreeBet);
      
      if (preflopStreet) {
        stats.total3Bets++;
        
        // Si le dernier street a un résultat positif, c'est un 3bet réussi
        const lastStreet = streets[streets.length - 1];
        if (lastStreet) {
          if (lastStreet.result > 0) {
            stats.successful3Bets++;
          }
          if (lastStreet.action === 'fold') {
            stats.fold3Bets++;
          }
        }
      }
      
      return stats;
    }, {
      total3Bets: 0,
      successful3Bets: 0,
      fold3Bets: 0
    });
  };

  const stats = calculate3BetStats();
  
  const data = {
    labels: ['Total 3-Bets', '3-Bets Gagnés', '3-Bets Foldés'],
    datasets: [{
      label: 'Statistiques 3-Bet',
      data: [stats.total3Bets, stats.successful3Bets, stats.fold3Bets],
      backgroundColor: [
        'rgba(54, 162, 235, 0.5)',
        'rgba(75, 192, 192, 0.5)',
        'rgba(255, 99, 132, 0.5)'
      ],
      borderColor: [
        'rgb(54, 162, 235)',
        'rgb(75, 192, 192)',
        'rgb(255, 99, 132)'
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
        text: 'Analyse des 3-Bets'
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
        Analyse des 3-Bets
      </Typography>
      <Bar data={data} options={options} />
    </Paper>
  );
};

export default ThreeBetAnalysis;