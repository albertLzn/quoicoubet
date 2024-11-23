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
    // Créer une copie du tableau avant de le trier
    return [...hands]
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

  // Ajouter une vérification pour éviter le rendu si pas de données
  if (hands.length === 0) {
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