import React from 'react';
import { Line } from 'react-chartjs-2';
import { Paper, Typography } from '@mui/material';
import { PokerRound } from '../../../types/hand';
import '../../../config/chartConfig';

interface ProfitTrendProps {
  rounds: PokerRound[];
}

const ProfitTrend: React.FC<ProfitTrendProps> = ({ rounds }) => {
  const calculateCumulativeProfit = () => {
    let cumulative = 0;
    
    return rounds.slice().sort((a, b) => a.timestamp - b.timestamp)
      .map(round => {
        const streets = Object.values(round.streets || {});
        const lastStreet = streets[streets.length - 1];
        if (lastStreet) {
          cumulative += lastStreet.result;
        }
        return {
          date: new Date(round.timestamp).toLocaleDateString(),
          profit: cumulative,
        };
      });
  };

  const profitData = calculateCumulativeProfit();

  const data = {
    labels: profitData.map(d => d.date),
    datasets: [
      {
        label: 'Profit cumulé (BB)',
        data: profitData.map(d => d.profit),
        fill: false,
        borderColor: 'rgb(53, 162, 235)',
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
        text: 'Évolution du Profit',
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        beginAtZero: true,
      },
      x: {
        type: 'category' as const,
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
        Courbe de Profit
      </Typography>
      <Line data={data} options={options} />
    </Paper>
  );
};

export default ProfitTrend;