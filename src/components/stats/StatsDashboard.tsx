import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Grid, Paper, Typography, Box, CircularProgress } from '@mui/material';
import { useSpring, animated } from 'react-spring';
import { RootState } from '../../store';
import { updateStats } from '../../features/stats/statsSlice';

interface StatCardProps {
  title: string;
  value: number;
  unit?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, unit = '' }) => {
  const animation = useSpring({
    from: { number: 0 },
    to: { number: value },
    config: { duration: 1000 },
  });

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <animated.div style={{ fontSize: '24px', fontWeight: 'bold' }}>
        {animation.number.to((n) => `${n.toFixed(2)}${unit}`)}
      </animated.div>
    </Paper>
  );
};

const StatsDashboard: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const rounds = useSelector((state: RootState) => state.rounds.rounds);
  const stats = useSelector((state: RootState) => state.stats);

  useEffect(() => {
    if (rounds.length > 0) {
      const totalRounds = rounds.length;
      const winningRounds = rounds.filter(round => {
        const streets = Object.values(round.streets);
        const lastStreet = streets[streets.length - 1];
        return lastStreet?.result > 0;
      });
      
      const totalBB = rounds.reduce((acc, round) => {
        const streets = Object.values(round.streets);
        const lastStreet = streets[streets.length - 1];
        return acc + (lastStreet?.result || 0);
      }, 0);

      dispatch(updateStats({
        totalHands: totalRounds,
        winRate: totalRounds > 0 ? (winningRounds.length / totalRounds) * 100 : 0,
        bbPer100: totalRounds > 0 ? (totalBB / totalRounds) * 100 : 0,
      }));
    }
  }, [rounds, dispatch]);

  if (stats.loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Grid container spacing={3} sx={{ mt: 2 }}>
      <Grid item xs={12} md={4}>
        <StatCard title="Total des mains" value={stats.totalHands} />
      </Grid>
      <Grid item xs={12} md={4}>
        <StatCard title="Win Rate" value={stats.winRate} unit="%" />
      </Grid>
      <Grid item xs={12} md={4}>
        <StatCard title="BB/100" value={stats.bbPer100} unit=" BB" />
      </Grid>
    </Grid>
  );
};

export default StatsDashboard;