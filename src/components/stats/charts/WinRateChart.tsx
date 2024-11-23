import React from 'react';
import { Line } from 'react-chartjs-2';
import { Paper, Typography } from '@mui/material';
import { Hand } from '../../../types/hand';

interface WinRateChartProps {
  hands: Hand[];
}

const WinRateChart: React.FC<WinRateChartProps> = ({ hands }) => {
  const calculateWinRate = () => {
    const sessions = hands.reduce((acc, hand) => {
      const date = new Date(hand.timestamp).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = { wins: 0, total: 0 };
      }
      acc[date].total++;
      if (hand.result > 0) acc[date].wins++;
      return acc;
    }, {} as Record<string, { wins: number; total: number }>);

    return Object.entries(sessions).map(([date, stats]) => ({
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