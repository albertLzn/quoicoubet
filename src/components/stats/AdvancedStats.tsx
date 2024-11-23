import React from 'react';
import { Grid } from '@mui/material';
import { Hand } from '../../types/hand';
import WinRateChart from './charts/WinRateChart';
import PositionStats from './charts/PositionStats';
import HandDistribution from './charts/HandDistribution';
import ProfitTrend from './charts/ProfitTrend';

interface AdvancedStatsProps {
  hands: Hand[];
}

const AdvancedStats: React.FC<AdvancedStatsProps> = ({ hands }) => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <WinRateChart hands={hands} />
      </Grid>
      <Grid item xs={12} md={6}>
        <PositionStats hands={hands} />
      </Grid>
      <Grid item xs={12} md={6}>
        <HandDistribution hands={hands} />
      </Grid>
      <Grid item xs={12} md={6}>
        <ProfitTrend hands={hands} />
      </Grid>
    </Grid>
  );
};

export default AdvancedStats;