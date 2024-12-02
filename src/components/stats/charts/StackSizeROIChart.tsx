import React from 'react';
import { Line } from 'react-chartjs-2';
import { Paper, Typography } from '@mui/material';
import { PokerRound } from '../../../types/hand';
import '../../../config/chartConfig';

interface StackSizeROIProps {
  rounds: PokerRound[];
}

// Fonction utilitaire pour catégoriser les tailles de stack
const categorizeStack = (stackSize: number): string => {
  if (stackSize <= 50) return '0-50 BB';
  if (stackSize <= 100) return '51-100 BB';
  if (stackSize <= 150) return '101-150 BB';
  return '150+ BB';
};

interface StackStats {
  profit: number;
  count: number;
}

const StackSizeROIChart: React.FC<StackSizeROIProps> = ({ rounds }) => {
  const calculateROIByStack = () => {
    return rounds.reduce((acc: Record<string, StackStats>, round) => {
      const stackCategory = categorizeStack(round.stackSize);
      const streets = Object.values(round.streets);
      const lastStreet = streets[streets.length - 1];
      
      if (!acc[stackCategory]) {
        acc[stackCategory] = { profit: 0, count: 0 };
      }

      if (lastStreet) {
        acc[stackCategory].profit += lastStreet.result;
        acc[stackCategory].count += 1;
      }

      return acc;
    }, {});
  };

  const roiData = calculateROIByStack();

  const data = {
    labels: Object.keys(roiData),
    datasets: [{
      label: 'ROI par taille de stack (%)',
      data: Object.values(roiData).map(stats => 
        stats.count > 0 ? (stats.profit / stats.count) * 100 : 0
      ),
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1
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
        text: 'ROI par Taille de Stack'
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
        ROI par Taille de Stack
      </Typography>
      <Line data={data} options={options} />
    </Paper>
  );
};

export default StackSizeROIChart;