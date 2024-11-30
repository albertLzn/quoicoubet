import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  Box,
  Grid,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { useSpring, animated } from 'react-spring';
import { RootState } from '../store';
import { Card, PokerRound } from '../types/hand';
import { actionIcons } from '../const/icons';
import { steps } from '../const/poker';
import SaveConfirmationDialog from './SaveConfirmationDialog';

const RoundCard: React.FC<{ round: PokerRound }> = ({ round }) => {
  const [showDetails, setShowDetails] = useState(false);
  const animation = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: { duration: 500 }
  });

  const streets = Object.values(round.streets);
  const lastStreet = streets[streets.length - 1];
  const isWin = lastStreet?.result > 0;
  const handleUpdateRoundData = (field: string, value: any) => {
    // Logique de mise à jour à implémenter
    console.log('Updating', field, value);
  };

  const handleUpdateRound = () => {
    // Logique de sauvegarde à implémenter
    console.log('Saving round updates');
    setShowDetails(false);
  };
  // Fonction pour afficher les cartes selon le step
  const getStepCards = (index: number) => {
    if (index === 0) {
      return (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {round.cards.map((card, idx) => (
            <Paper
              key={idx}
              sx={{
                p: 0.5,
                color: ['hearts', 'diamonds'].includes(card.suit) ? 'red' : 'black',
                bgcolor: 'rgba(255, 255, 255, 0.9)',
                border: '2px solid gold',
                borderRadius: 1,
                fontSize: '0.8rem',
                fontWeight: 'bold'
              }}
            >
              {card.value}{card.suit.charAt(0)}
            </Paper>
          ))}
        </Box>
      );
    } else {
      const street = round.streets[steps[index].toLowerCase()];
      if (street?.communityCards?.length) {
        let cardsToShow: Card[] = [];
        switch(index) {
          case 1: // Flop
            cardsToShow = street.communityCards.slice(0, 3);
            break;
          case 2: // Turn
            cardsToShow = street.communityCards.slice(3, 4);
            break;
          case 3: // River
            cardsToShow = street.communityCards.slice(4, 5);
            break;
        }
        
        return (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {cardsToShow.map((card, idx) => (
              <Paper
                key={idx}
                sx={{
                  p: 0.5,
                  color: ['hearts', 'diamonds'].includes(card.suit) ? 'red' : 'black',
                  bgcolor: 'rgba(255, 255, 255, 0.7)',
                  borderRadius: 1,
                  fontSize: '0.8rem'
                }}
              >
                {card.value}{card.suit.charAt(0)}
              </Paper>
            ))}
          </Box>
        );
      }
    }
    return null;
  };

  return (
    <animated.div style={animation}>
      <Paper 
        sx={{ 
          p: 2, 
          mb: 2, 
          display: 'flex', 
          alignItems: 'center',
          background: isWin 
            ? 'linear-gradient(45deg, rgba(200, 250, 205, 0.6), rgba(200, 250, 205, 0.9))'
            : 'linear-gradient(45deg, rgba(255, 200, 200, 0.6), rgba(255, 200, 200, 0.9))',
          cursor: 'pointer'
        }}
        onClick={() => setShowDetails(true)}
      >
        <Box sx={{ flex: 1, mx: 3 }}>
          <Stepper sx={{
            '& .MuiStepLabel-label': {
              display: { xs: 'none', sm: 'block' }
            },
            '& .MuiStep-root': {
              px: { xs: 0, sm: 1 }
            }
          }}>
            {steps.map((label, index) => (
              <Step key={label} completed={index < streets.length}>
                <StepLabel
                  icon={
                    index < streets.length && streets[index].action
                      ? <Tooltip title={`${streets[index].action.toUpperCase()} (${streets[index].pot} BB)`}>
                          <Box sx={{ color: 'primary.main' }}>
                            {actionIcons[streets[index].action]}
                          </Box>
                        </Tooltip>
                      : index + 1
                  }
                >
                  {getStepCards(index)}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        <Box sx={{
          width: '150px',
          textAlign: 'right',
          color: isWin ? 'success.main' : 'error.main'
        }}>
          <Typography variant="h6">
            {isWin ? '+' : ''}{lastStreet?.result} BB
          </Typography>
        </Box>
      </Paper>
      <SaveConfirmationDialog
        mode="edit"
        open={showDetails}
        onClose={() => setShowDetails(false)}
        onSave={handleUpdateRound}
        roundData={{
          cards: round.cards,
          position: round.position,
          action: Object.values(round.streets)[0]?.action || 'fold',
          pot: String(Object.values(round.streets)[0]?.pot || 0),
          stackSize: round.stackSize,
          blindLevel: round.blindLevel,
          isWin: Object.values(round.streets).slice(-1)[0]?.result > 0,
          streets: round.streets
        }}
        onUpdateData={handleUpdateRoundData}
      />
    </animated.div>
  );
};

const RoundsList: React.FC = () => {
  const rounds = useSelector((state: RootState) => state.rounds.rounds);
  console.log('the rounds ', rounds);
  const [sortBy, setSortBy] = useState<'date' | 'result' | 'action'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterAction, setFilterAction] = useState<string>('all');

  // Tri des rounds
  const sortedRounds = useMemo(() => {
    let sorted = [...rounds];
    
    switch (sortBy) {
      case 'date':
        sorted.sort((a, b) => sortOrder === 'desc' ? 
          b.timestamp - a.timestamp : 
          a.timestamp - b.timestamp
        );
        break;
      case 'result':
        sorted.sort((a, b) => {
          const resultA = Object.values(a.streets).slice(-1)[0]?.result || 0;
          const resultB = Object.values(b.streets).slice(-1)[0]?.result || 0;
          return sortOrder === 'desc' ? resultB - resultA : resultA - resultB;
        });
        break;
      case 'action':
        sorted.sort((a, b) => {
          const actionA = Object.values(a.streets)[0]?.action || '';
          const actionB = Object.values(b.streets)[0]?.action || '';
          return sortOrder === 'desc' ? 
            actionB.localeCompare(actionA) : 
            actionA.localeCompare(actionB);
        });
        break;
    }

    // Filtrage par action
    if (filterAction !== 'all') {
      sorted = sorted.filter(round => 
        Object.values(round.streets).some(street => 
          street.action === filterAction
        )
      );
    }

    return sorted;
  }, [rounds, sortBy, sortOrder, filterAction]);

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Historique des mains
      </Typography>

      {/* Filtres et tri */}
      <Box sx={{ 
        mb: 3, 
        p: 2, 
        backgroundColor: 'background.paper',
        borderRadius: 1,
        display: 'flex',
        gap: 2,
        flexWrap: 'wrap'
      }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Trier par</InputLabel>
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'result' | 'action')}
            label="Trier par"
          >
            <MenuItem value="date">Date</MenuItem>
            <MenuItem value="result">Gains</MenuItem>
            <MenuItem value="action">Action</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Ordre</InputLabel>
          <Select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
            label="Ordre"
          >
            <MenuItem value="desc">Décroissant</MenuItem>
            <MenuItem value="asc">Croissant</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Action</InputLabel>
          <Select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            label="Action"
          >
            <MenuItem value="all">Toutes</MenuItem>
            <MenuItem value="fold">Fold</MenuItem>
            <MenuItem value="call">Call</MenuItem>
            <MenuItem value="raise">Raise</MenuItem>
            <MenuItem value="bet">Bet</MenuItem>
            <MenuItem value="check">Check</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Liste des rounds */}
      {sortedRounds.map((round: PokerRound) => (
        <RoundCard key={round.id} round={round} />
      ))}
    </Box>
  );
};

export default RoundsList;