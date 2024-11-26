import React from 'react';
import { Line } from 'react-chartjs-2';
import { Paper, Typography } from '@mui/material';
import { Hand, PokerRound,StreetAction } from '../../../types/hand';

interface WinRateChartProps {
  rounds: PokerRound[];
}

const WinRateChart: React.FC<WinRateChartProps> = ({ rounds }) => {
  interface SessionStats {
    wins: number;
    total: number;
  }
  const calculateWinRate = () => {
    const sessions = rounds.reduce((acc: Record<string, SessionStats>, round: PokerRound) => {
      const date = new Date(round.timestamp).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = { wins: 0, total: 0 };
      }
      
      const streets = Object.values(round.streets);
      const lastStreet = streets[streets.length - 1] as StreetAction;
      
      acc[date].total++;
      if (lastStreet && lastStreet.result > 0) {
        acc[date].wins++;
      }
      
      return acc;
    }, {});

    return Object.entries(sessions).map(([date, stats]: [string, SessionStats]) => ({
      date,
      winRate: (stats.wins / stats.total) * 100,
    }));
  };
  const winRateData = calculateWinRate();

  const data = {
    labels: winRateData.map(d => d.date),
    datasets: [
      {
        label: 'Win Rate %',
        data: winRateData.map(d => d.winRate),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
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
        text: 'Évolution du Win Rate',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
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
        Win Rate par Session
      </Typography>
      <Line data={data} options={options} />
    </Paper>
  );
};

export default WinRateChart;