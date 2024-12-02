import React from 'react';
import { Grid } from '@mui/material';
import { PokerRound } from '../../types/hand';
import WinRateChart from './charts/WinRateChart';
import PositionStats from './charts/PositionStats';
import HandDistribution from './charts/HandDistribution';
import ProfitTrend from './charts/ProfitTrend';
import StackSizeROIChart from './charts/StackSizeROIChart';
import BlindLevelAnalysis from './charts/BlindLevelAnalysis';
import SessionDurationStats from './charts/SessionDurationStats';
import ThreeBetAnalysis from './charts/ThreeBetAnalysis';
import ContinuationBetAnalysis from './charts/ContinuationBetAnalysis';

interface AdvancedStatsProps {
  rounds: PokerRound[];
}

const AdvancedStats: React.FC<AdvancedStatsProps> = ({ rounds }) => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <WinRateChart rounds={rounds} />
      </Grid>
      <Grid item xs={12} md={6}>
        <ProfitTrend rounds={rounds} />
      </Grid>
      <Grid item xs={12} md={6}>
        <PositionStats rounds={rounds} />
      </Grid>
      <Grid item xs={12} md={6}>
        <HandDistribution rounds={rounds} />
      </Grid>
      <Grid item xs={12} md={6}>
        <StackSizeROIChart rounds={rounds} />
      </Grid>
      <Grid item xs={12} md={6}>
        <BlindLevelAnalysis rounds={rounds} />
      </Grid>
      <Grid item xs={12} md={6}>
        <SessionDurationStats rounds={rounds} />
      </Grid>
      <Grid item xs={12} md={6}>
        <ThreeBetAnalysis rounds={rounds} />
      </Grid>
      <Grid item xs={12} md={6}>
        <ContinuationBetAnalysis rounds={rounds} />
      </Grid>
    </Grid>
  );
};

export default AdvancedStats;