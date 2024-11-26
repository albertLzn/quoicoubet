import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  ListItemIcon,
  Stepper,
  Step,
  StepLabel,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { Card, PokerRound } from '../../types/hand';
import CardSelector from './CardSelector';
import { database } from '../../config/firebase';
import { ref, push } from 'firebase/database';
import { RootState } from '../../store';
import {
  CallEnd as FoldIcon,
  Call as CallIcon,
  TrendingUp as RaiseIcon,
  Casino as BetIcon,
  RadioButtonUnchecked as CheckIcon,
} from '@mui/icons-material';
import { addRound } from '../../features/rounds/roundsSlice';


type PokerAction = 'fold' | 'call' | 'raise' | 'bet' | 'check';

const actionIcons = {
  fold: <FoldIcon />,
  call: <CallIcon />,
  raise: <RaiseIcon />,
  bet: <BetIcon />,
  check: <CheckIcon />,
};
const HandTracker: React.FC = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [position, setPosition] = useState('');
  const [action, setAction] = useState<PokerAction>('fold');
  const [pot, setPot] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [result, setResult] = useState<number>(0);
  const [isWin, setIsWin] = useState(false);
  const [stackSize, setStackSize] = useState<number>(0);
  const [blindLevel, setBlindLevel] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');
  const [roundData, setRoundData] = useState<PokerRound>({
    id: '',
    userId: user?.uid,
    cards: [],
    position: '',
    timestamp: Date.now(),
    streets: {},
    // Nouvelles propriétés
    stackSize: 0,
    blindLevel: '',
    sessionId: Date.now().toString()
  });

  const steps = ['Preflop', 'Flop', 'Turn', 'River'];
  const handleCardSelect = (card: Card) => {
    if (selectedCards.length < 2) {
      setSelectedCards([...selectedCards, card]);
    }
  };

  const handleSaveRound = async () => {
    const currentStreet = steps[activeStep].toLowerCase();
    const updatedRoundData = {
      ...roundData,
      cards: selectedCards,
      position,
      stackSize,
      blindLevel,
      sessionId: sessionId || Date.now().toString(), // Génère un ID si non fourni
      streets: {
        ...roundData.streets,
        [currentStreet]: {
          action,
          pot: Number(pot),
          timestamp: Date.now(),
          result: isWin ? 1 : -1,
          isThreeBet: false, // À gérer via l'UI
          isCBet: false, // À gérer via l'UI
        }
      }
    };
  
    try {
      const roundRef = await push(ref(database, `rounds/${user?.uid}`), updatedRoundData);
      if (roundRef.key) {
        dispatch(addRound({ ...updatedRoundData, id: roundRef.key }));
        
        // Reset form
        setSelectedCards([]);
        setPosition('');
        setPot('');
        setAction('fold');
        setActiveStep(0);
        setRoundData({
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
      }
    } catch (error) {
      console.error('Error saving round:', error);
    }
  };
  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Stepper activeStep={activeStep}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
        <CardSelector
          selectedCards={selectedCards}
          onCardSelect={handleCardSelect}
          disabled={activeStep > 0}
        />

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
    <MenuItem value="200/400">200/400</MenuItem>
    <MenuItem value="500/1000">500/1000</MenuItem>
  </Select>
</FormControl>

        <FormControl fullWidth sx={{ mb: 2 }}>
        <TextField
      fullWidth
      label="Your stack size (BB)"
      type="number"
      value={stackSize}
      onChange={(e) => setStackSize(Number(e.target.value))}
      sx={{ mb: 2 }}
      required
    />
        </FormControl>
        
        <FormControl fullWidth sx={{ mb: 2 }}>
  <InputLabel>Position</InputLabel>
  <Select
    value={position}
    onChange={(e) => setPosition(e.target.value)}
    required
  >
    <MenuItem value="BB">Big Blind</MenuItem>
    <MenuItem value="SB">Small Blind</MenuItem>
    <MenuItem value="BTN">Button</MenuItem>
    <MenuItem value="CO">Cutoff</MenuItem>
    <MenuItem value="MP">Middle Position</MenuItem>
    <MenuItem value="EP">Early Position</MenuItem>
  </Select>
</FormControl>

        <TextField
          fullWidth
          label="Taille du pot"
          type="number"
          value={pot}
          onChange={(e) => setPot(e.target.value)}
          sx={{ mb: 2 }}
          required
        />



<FormControl fullWidth sx={{ mb: 2 }}>
  <InputLabel>Action</InputLabel>
  <Select
    value={action}
    onChange={(e) => setAction(e.target.value as PokerAction)}
    required
  >
    <MenuItem value="fold">
      <ListItemIcon>{actionIcons.fold}</ListItemIcon>
      Fold
    </MenuItem>
    <MenuItem value="call">
      <ListItemIcon>{actionIcons.call}</ListItemIcon>
      Call
    </MenuItem>
    <MenuItem value="raise">
      <ListItemIcon>{actionIcons.raise}</ListItemIcon>
      Raise
    </MenuItem>
    <MenuItem value="bet">
      <ListItemIcon>{actionIcons.bet}</ListItemIcon>
      Bet
    </MenuItem>
    <MenuItem value="check">
      <ListItemIcon>{actionIcons.check}</ListItemIcon>
      Check
    </MenuItem>
  </Select>
  <FormControlLabel
  control={
    <Checkbox
      checked={result > 0}
      onChange={(e) => setResult(e.target.checked ? 1 : -1)}
    />
  }
  label="Round gagné"
  sx={{ mb: 2 }}
/>
</FormControl>
<Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
  <Button
    variant="outlined"
    onClick={handleSaveRound}
    disabled={!position || !pot || selectedCards.length !== 2}
  >
    Enregistrer
  </Button>
  
  {activeStep < steps.length - 1 && (
    <Button
      variant="contained"
      onClick={() => {
        const currentStreet = steps[activeStep].toLowerCase();
        setRoundData(prev => ({
          ...prev,
          cards: selectedCards,
          position,
          streets: {
            ...prev.streets,
            [currentStreet]: {
              action,
              pot: Number(pot),
              timestamp: Date.now()
            }
          }
        }));
        setActiveStep(prev => prev + 1);
        setPot('');
        setAction('fold');
      }}
      disabled={!position || !pot || selectedCards.length !== 2}
    >
      Suivant
    </Button>
  )}
</Box>
    </Paper>
  );
};

export default HandTracker;