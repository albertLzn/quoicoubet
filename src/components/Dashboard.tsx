import React, { useEffect, useState } from 'react';
import { CircularProgress, Grid, Paper, Typography, Button, Box } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import StatsDashboard from './stats/StatsDashboard';
import RoundsList from './RoundsList';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { roundService } from '../services/roundService';
import { setRounds } from '../features/rounds/roundsSlice';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const rounds = useSelector((state: RootState) => state.rounds.rounds);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRounds = async () => {
      if (user) {
        setIsLoading(true);
        try {
          const userRounds = await roundService.getUserRounds(user.uid);
          dispatch(setRounds(userRounds));
        } catch (error) {
          console.error('Erreur lors du chargement des rounds:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    loadRounds();
  }, [dispatch, user]);

  if (isLoading) {
    return <CircularProgress />;
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h5" gutterBottom>Tableau de bord</Typography>

      <Grid item xs={12}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            startIcon={<AddIcon />}
            onClick={() => navigate('/track')}
            sx={{
              py: 2,
              px: 4,
              borderRadius: 2,
              fontSize: '1.1rem',
              textTransform: 'none',
              boxShadow: 3
            }}
          >
            Créer une nouvelle main
          </Button>
        </Box>
      </Grid>
          <StatsDashboard />
        </Paper>
      </Grid>


      <Grid item xs={12}>
        <RoundsList />
      </Grid>
    </Grid>
  );
};

export default Dashboard;