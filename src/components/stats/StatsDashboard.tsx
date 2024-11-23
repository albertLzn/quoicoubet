import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Grid, Paper, Typography, Box, CircularProgress } from '@mui/material';
import { useSpring, animated } from 'react-spring';
import { RootState } from '../../store';
import { updateStats, setLoading } from '../../features/stats/statsSlice';
import { database } from '../../config/firebase';
import { ref, get } from 'firebase/database';
import { Hand } from '../../types/hand';
import { calculateVPIP, calculatePFR } from '../../utils/pokerCalculations';

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
      <animated.div>
        {animation.number.to((n) => `${n.toFixed(2)}${unit}`)}
      </animated.div>
    </Paper>
  );
};

const StatsDashboard: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const stats = useSelector((state: RootState) => state.stats);

  useEffect(() => {
    const calculateStats = async () => {
      dispatch(setLoading(true));
      try {
        const handsRef = ref(database, `hands/${user?.uid}`);
        const snapshot = await get(handsRef);
        const handsData = snapshot.val();
        
        const handsArray: Hand[] = handsData ? Object.values(handsData).map((hand: any): Hand => ({
          id: hand.id,
          userId: hand.userId,
          cards: hand.cards,
          position: hand.position,
          action: hand.action,
          street: hand.street,
          pot: hand.pot,
          result: hand.result,
          timestamp: hand.timestamp,
          notes: hand.notes
        })) : [];

        const totalHands = handsArray.length;
        const winningHands = handsArray.filter(hand => hand.result > 0);
        const totalBB = handsArray.reduce((acc, hand) => acc + hand.result, 0);

        dispatch(updateStats({
          totalHands,
          winRate: totalHands > 0 ? (winningHands.length / totalHands) * 100 : 0,
          bbPer100: totalHands > 0 ? (totalBB / totalHands) * 100 : 0,
          vpip: calculateVPIP(handsArray),
          pfr: calculatePFR(handsArray),
        }));
      } catch (error) {
        console.error('Error calculating stats:', error);
      } finally {
        dispatch(setLoading(false));
      }
    };

    if (user) {
      calculateStats();
    }
  }, [dispatch, user]);

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
      <Grid item xs={12} md={6}>
        <StatCard title="VPIP" value={stats.vpip} unit="%" />
      </Grid>
      <Grid item xs={12} md={6}>
        <StatCard title="PFR" value={stats.pfr} unit="%" />
      </Grid>
    </Grid>
  );
};

export default StatsDashboard;