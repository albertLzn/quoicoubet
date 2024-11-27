import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Button, TextField, FormControl, InputLabel, Select, MenuItem, 
  Paper, ListItemIcon, Stepper, Step, StepLabel, FormControlLabel,
  Checkbox, Dialog, DialogTitle, DialogContent, DialogActions,
  Typography, Grid,
  Drawer
} from '@mui/material';
import {
  CallEnd as FoldIcon, Call as CallIcon, TrendingUp as RaiseIcon,
  Casino as BetIcon, RadioButtonUnchecked as CheckIcon, Settings
} from '@mui/icons-material';
import { useSpring, animated } from 'react-spring';
import { Card, PokerRound } from '../../types/hand';
import { database } from '../../config/firebase';
import { ref, push } from 'firebase/database';
import { RootState } from '../../store';
import { addRound } from '../../features/rounds/roundsSlice';
import PokerRangeTable from '../PokerRangeTable';
import { CardValue, Position } from '../../types/poker';

type PokerAction = 'fold' | 'call' | 'raise' | 'bet' | 'check';
type Suit = 'hearts' | 'diamonds' | 'spades' | 'clubs';

const actionIcons = {
  fold: <FoldIcon />,
  call: <CallIcon />,
  raise: <RaiseIcon />,
  bet: <BetIcon />,
  check: <CheckIcon />,
};

const CardSlot: React.FC<{
  card: Card | null;
  onClick: () => void;
}> = ({ card, onClick }) => (
  <Paper
    sx={{
      width: 60,
      height: 90,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: card ? 'white' : 'rgba(255,255,255,0.1)'
    }}
    onClick={onClick}
  >
    {card && (
      <Typography 
        sx={{ 
          color: ['hearts', 'diamonds'].includes(card.suit) ? 'red' : 'black'
        }}
      >
        {card.value}{card.suit.charAt(0)}
      </Typography>
    )}
  </Paper>
);

const CardSelectorDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  selectedCards: Card[];
  onCardSelect: (card: Card) => void;
}> = ({ open, onClose, selectedCards, onCardSelect }) => {
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const values = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
  const suits: Suit[] = ['hearts', 'diamonds', 'spades', 'clubs'];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Sélectionner une carte</DialogTitle>
      <DialogContent>
        <Grid container spacing={1}>
          {values.map((value) => (
            <Grid item key={value} xs={2}>
              <Button
                variant={selectedValue === value ? 'contained' : 'outlined'}
                onClick={() => setSelectedValue(value)}
                fullWidth
              >
                {value}
              </Button>
            </Grid>
          ))}
        </Grid>
        
        {selectedValue && (
          <Grid container spacing={2} sx={{ mt: 2 }}>
            {suits.map((suit) => {
              const isDisabled = selectedCards.some(
                card => card.value === selectedValue && card.suit === suit
              );
              return (
                <Grid item xs={6} key={suit}>
                  <Button
                    variant="contained"
                    fullWidth
                    disabled={isDisabled}
                    onClick={() => onCardSelect({ value: selectedValue, suit })}
                    sx={{
                      color: ['hearts', 'diamonds'].includes(suit) ? 'red' : 'black',
                      opacity: isDisabled ? 0.5 : 1
                    }}
                  >
                    {suit}
                  </Button>
                </Grid>
              );
            })}
          </Grid>
        )}
      </DialogContent>
    </Dialog>
  );
};

const HandTracker: React.FC = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  
  // États existants
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [position, setPosition] = useState('');
  const [action, setAction] = useState<PokerAction>('fold');
  const [pot, setPot] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [result, setResult] = useState<number>(0);
  const [isWin, setIsWin] = useState(false);
  const [stackSize, setStackSize] = useState<number>(0);
  const [blindLevel, setBlindLevel] = useState<string>('');
  const [sessionId] = useState<string>(Date.now().toString());
  const [priceToCall, setPriceToCall] = useState<number>(0);

  // Nouveaux états pour l'interface
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [cardSelectorOpen, setCardSelectorOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [communityCards, setCommunityCards] = useState<(Card | null)[]>([null, null, null, null, null]);
  const [openPredictions, setOpenPredictions] = useState(false);
  const [roundData, setRoundData] = useState<PokerRound>({
    id: '',
    userId: user?.uid,
    cards: [],
    position: '',
    timestamp: Date.now(),
    streets: {},
    stackSize: 0,
    blindLevel: '',
    sessionId: Date.now().toString()
  });
  const steps = ['Preflop', 'Flop', 'Turn', 'River'];
  const streets = Object.values(roundData.streets);

  const canShowPredictions = selectedCards.length === 2 && position && stackSize > 0;

  const handleSaveRound = async () => {
    const currentStreet = steps[activeStep].toLowerCase();
    const roundData: PokerRound = {
      id: '',
      userId: user?.uid,
      cards: selectedCards,
      position,
      timestamp: Date.now(),
      streets: {
        [currentStreet]: {
          action,
          pot: Number(pot),
          timestamp: Date.now(),
          result: isWin ? 1 : -1,
          isThreeBet: false,
          isCBet: false
        }
      },
      stackSize,
      blindLevel,
      sessionId
    };

    try {
      const roundRef = await push(ref(database, `rounds/${user?.uid}`), roundData);
      if (roundRef.key) {
        dispatch(addRound({ ...roundData, id: roundRef.key }));
        setSelectedCards([]);
        setCommunityCards([null, null, null, null, null]);
        setPosition('');
        setPot('');
        setAction('fold');
        setActiveStep(0);
      }
    } catch (error) {
      console.error('Error saving round:', error);
    }
  };

  return (
    <Box sx={{ 
      width: '100%', 
      height: '600px', 
      backgroundColor: '#35654d',
      borderRadius: '50%',
      position: 'relative',
      padding: 2
    }}>
      <Stepper activeStep={activeStep} sx={{ position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', width: '80%' }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Position du joueur */}
      <FormControl sx={{ position: 'absolute', bottom: '120px', left: '50%', transform: 'translateX(-50%)', width: '200px' }}>
        <Select
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          size="small"
        >
          <MenuItem value="BB">Big Blind</MenuItem>
          <MenuItem value="SB">Small Blind</MenuItem>
          <MenuItem value="BTN">Button</MenuItem>
          <MenuItem value="CO">Cutoff</MenuItem>
          <MenuItem value="MP">Middle Position</MenuItem>
          <MenuItem value="UTG">Under the Gun</MenuItem>
        </Select>
      </FormControl>

      {/* Taille du pot */}
      <TextField
        size="small"
        type="number"
        value={pot}
        onChange={(e) => setPot(e.target.value)}
        label="Taille du pot"
        sx={{ position: 'absolute', top: '30%', left: '50%', transform: 'translateX(-50%)', width: '150px' }}
      />

      {/* Stack size */}
      <TextField
        size="small"
        type="number"
        value={stackSize}
        onChange={(e) => setStackSize(Number(e.target.value))}
        label="Stack (BB)"
        sx={{ position: 'absolute', bottom: '-30px', left: '50%', transform: 'translateX(-50%)', width: '150px' }}
      />

      {/* Cartes communautaires */}
      <Box sx={{ 
        position: 'absolute', 
        top: '50%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)',
        display: 'flex',
        gap: 2
      }}>
        {communityCards.map((card, index) => (
          <CardSlot
            key={index}
            card={card}
            onClick={() => {
              setSelectedSlot(index);
              setCardSelectorOpen(true);
            }}
          />
        ))}
      </Box>

      {/* Cartes du joueur */}
      <Box sx={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: 2
      }}>
        {[0, 1].map((index) => (
          <CardSlot
            key={`player-${index}`}
            card={selectedCards[index] || null}
            onClick={() => {
              setSelectedSlot(index + 5);
              setCardSelectorOpen(true);
            }}
          />
        ))}
      </Box>

      {/* Boutons d'action */}
      <Box sx={{ position: 'absolute', right: 20, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Button 
          variant="contained"
          onClick={() => setDrawerOpen(true)}
          startIcon={<Settings />}
        >
          Options
        </Button>

        {canShowPredictions && (
          <Button
            variant="contained"
            color="secondary"
            onClick={() => setOpenPredictions(true)}
          >
            Prédictions
          </Button>
        )}

        {activeStep < steps.length - 1 && (
          <Button
            variant="contained"
            onClick={() => {
              const currentStreet = steps[activeStep].toLowerCase();
              setRoundData(prev => ({
                ...prev,
                streets: {
                  ...prev.streets,
                  [currentStreet]: {
                    action,
                    pot: Number(pot),
                    timestamp: Date.now(),
                    result: isWin ? 1 : -1,
                    isThreeBet: false,
                    isCBet: false
                  }
                }
              }));
              setActiveStep(prev => prev + 1);
              setPot('');
              setAction('fold');
            }}
          >
            Suivant
          </Button>
        )}
      </Box>

      {/* Dialogs et Drawer */}
      <CardSelectorDialog
        open={cardSelectorOpen}
        onClose={() => setCardSelectorOpen(false)}
        selectedCards={[...selectedCards, ...communityCards.filter((c): c is Card => c !== null)]}
        onCardSelect={(card) => {
          if (selectedSlot !== null) {
            if (selectedSlot >= 5) {
              const newSelectedCards = [...selectedCards];
              newSelectedCards[selectedSlot - 5] = card;
              setSelectedCards(newSelectedCards);
            } else {
              const newCommunityCards = [...communityCards];
              newCommunityCards[selectedSlot] = card;
              setCommunityCards(newCommunityCards);
            }
          }
          setCardSelectorOpen(false);
        }}
      />

      <Dialog
        open={openPredictions}
        onClose={() => setOpenPredictions(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Analyse de Range</DialogTitle>
        <DialogContent>
          <PokerRangeTable
            card1={selectedCards[0]?.value as CardValue}
            card2={selectedCards[1]?.value as CardValue}
            position={position as Position}
            stack={stackSize}
            remainingPlayers={2}
            tendency="neutral"
            priceToCall={priceToCall}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPredictions(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 300, p: 2 }}>
          <Typography variant="h6" gutterBottom>Options de jeu</Typography>
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Action</InputLabel>
            <Select
              value={action}
              onChange={(e) => setAction(e.target.value as PokerAction)}
              required
            >
              {Object.entries(actionIcons).map(([key, icon]) => (
                <MenuItem key={key} value={key}>
                  <ListItemIcon>{icon}</ListItemIcon>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Niveau de Blinds</InputLabel>
            <Select
              value={blindLevel}
              onChange={(e) => setBlindLevel(e.target.value)}
              required
            >
              <MenuItem value="2/4">2/4</MenuItem>
              <MenuItem value="5/10">5/10</MenuItem>
              <MenuItem value="10/20">10/20</MenuItem>
              <MenuItem value="20/40">20/40</MenuItem>
              <MenuItem value="25/50">25/50</MenuItem>
              <MenuItem value="50/100">50/100</MenuItem>
              <MenuItem value="100/200">100/200</MenuItem>
            </Select>
          </FormControl>
          <TextField
              fullWidth
              label="Prix pour suivre (BB)"
              type="number"
              value={priceToCall}
              onChange={(e) => setPriceToCall(Number(e.target.value))}
              sx={{ mb: 2 }}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={isWin}
                  onChange={(e) => {
                    setIsWin(e.target.checked);
                    setResult(e.target.checked ? 1 : -1);
                  }}
                />
              }
              label="Round gagné"
              sx={{ mb: 2 }}
            />

            <Button 
              variant="contained" 
              fullWidth 
              onClick={() => {
                handleSaveRound();
                setDrawerOpen(false);
              }}
            >
              Sauvegarder
            </Button>
          </Box>
        </Drawer>
      </Box>
  );
};

export default HandTracker;