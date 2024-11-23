import React from 'react';
import { Line } from 'react-chartjs-2';
import { Paper, Typography } from '@mui/material';
import { Hand } from '../../../types/hand';

interface ProfitTrendProps {
  hands: Hand[];
}

const ProfitTrend: React.FC<ProfitTrendProps> = ({ hands }) => {
  const calculateCumulativeProfit = () => {
    let cumulative = 0;
    return hands
      .sort((a, b) => a.timestamp - b.timestamp)
      .map(hand => {
        cumulative += hand.result;
        return {
          date: new Date(hand.timestamp).toLocaleDateString(),
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
        fill: true,
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.1)',
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
  };

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