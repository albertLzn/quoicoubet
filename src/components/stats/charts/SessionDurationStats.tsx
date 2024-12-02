import React from 'react';
import { Line } from 'react-chartjs-2';
import { Paper, Typography } from '@mui/material';
import { PokerRound } from '../../../types/hand';

interface SessionDurationProps {
  rounds: PokerRound[];
}

interface Session {
  rounds: PokerRound[];
  startTime: number;
  endTime: number;
}

const SessionDurationStats: React.FC<SessionDurationProps> = ({ rounds }) => {
  const groupBySession = (rounds: PokerRound[]): Session[] => {
    const sessionMap = rounds.reduce((acc: Record<string, PokerRound[]>, round) => {
      if (!acc[round.sessionId]) {
        acc[round.sessionId] = [];
      }
      acc[round.sessionId].push(round);
      return acc;
    }, {});

    return Object.values(sessionMap).map(sessionRounds => ({
      rounds: sessionRounds,
      startTime: Math.min(...sessionRounds.map(r => r.timestamp)),
      endTime: Math.max(...sessionRounds.map(r => r.timestamp))
    }));
  };

  const calculateSessionProfit = (session: Session): number => {
    return session.rounds.reduce((total, round) => {
      const streets = Object.values(round.streets);
      const lastStreet = streets[streets.length - 1];
      return total + (lastStreet?.result || 0);
    }, 0);
  };

  const calculateProfitByDuration = () => {
    const sessions = groupBySession(rounds);
    return sessions.map(session => ({
      duration: Math.floor((session.endTime - session.startTime) / (1000 * 60)), // En minutes
      profit: calculateSessionProfit(session)
    }));
  };

  const sessionData = calculateProfitByDuration();

  const data = {
    labels: sessionData.map(d => `${d.duration} min`),
    datasets: [{
      label: 'Profit par durée de session (BB)',
      data: sessionData.map(d => d.profit),
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
        text: 'Profit par Durée de Session'
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
        Profit par Durée de Session
      </Typography>
      <Line data={data} options={options} />
    </Paper>
  );
};

export default SessionDurationStats;