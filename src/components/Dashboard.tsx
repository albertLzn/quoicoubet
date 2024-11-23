import React from 'react';
import { Grid, Paper, Typography } from '@mui/material';
import StatsDashboard from './stats/StatsDashboard';

const Dashboard: React.FC = () => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h5">Tableau de bord</Typography>
          <StatsDashboard />
        </Paper>
      </Grid>
    </Grid>
  );
};

export default Dashboard;