import React from 'react';
import { useSelector } from 'react-redux';
import { 
  Paper, 
  Typography, 
  Stepper, 
  Step, 
  StepLabel,
  IconButton,
  Box,
  Grid 
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { useSpring, animated } from 'react-spring';
import { RootState } from '../store';
import { PokerRound } from '../types/hand';

const RoundCard: React.FC<{ round: PokerRound }> = ({ round }) => {
  const animation = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: { duration: 500 }
  });

  const steps = ['Preflop', 'Flop', 'Turn', 'River'];
  const streets = Object.values(round.streets);
  const lastStreet = streets[streets.length - 1];
  const isWin = lastStreet?.result > 0;

  return (
    <animated.div style={animation}>
      <Paper sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center' }}>
        {/* Cartes du joueur */}
        <Box sx={{ width: '120px' }}>
          <Typography variant="subtitle2" gutterBottom>
            Main
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {round.cards.map((card, idx) => (
              <Paper 
                key={idx}
                sx={{ 
                  p: 1, 
                  color: ['hearts', 'diamonds'].includes(card.suit) ? 'red' : 'black'
                }}
              >
                {card.value}{card.suit.charAt(0)}
              </Paper>
            ))}
          </Box>
        </Box>
{/* Stepper et actions */}
<Box sx={{ flex: 1, mx: 3 }}>
  <Stepper>
    {steps.map((label, index) => (
      <Step key={label} completed={index < streets.length}>
        <StepLabel>{label}</StepLabel>
      </Step>
    ))}
  </Stepper>
  <Grid container sx={{ mt: 2 }}>
    {steps.map((step, idx) => (
      <Grid 
        item 
        xs={3}  // Fixé à 3 (12/4) pour avoir toujours 4 colonnes
        key={idx} 
        sx={{ 
          textAlign: 'center',
          px: 1
        }}
      >
        {idx < streets.length && (
          <Typography variant="body2">
            {streets[idx].action.toUpperCase()} ({streets[idx].pot} BB)
          </Typography>
        )}
      </Grid>
    ))}
  </Grid>
</Box>
        {/* Résultat */}
        <Box sx={{ 
          width: '150px',
          textAlign: 'right',
          color: isWin ? 'success.main' : 'error.main'
        }}>
          <Typography variant="h6">
            {isWin ? '+' : ''}{lastStreet?.result} BB
          </Typography>
          <Box>
            <IconButton size="small">
              <Edit />
            </IconButton>
            <IconButton size="small" color="error">
              <Delete />
            </IconButton>
          </Box>
        </Box>
      </Paper>
    </animated.div>
  );
};

const RoundsList: React.FC = () => {
  const rounds = useSelector((state: RootState) => state.rounds.rounds);
    console.log('the rounds ', rounds)
  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Historique des mains
      </Typography>
      {rounds.map((round) => (
        <RoundCard key={round.id} round={round} />
      ))}
    </Box>
  );
};

export default RoundsList;