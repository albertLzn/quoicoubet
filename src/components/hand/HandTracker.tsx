import React, { ChangeEvent, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Paper,
  ListItemIcon
} from '@mui/material';
import { useSpring, animated } from 'react-spring';
import { Card as CardType, Hand, Street } from '../../types/hand';
import { addHand } from '../../features/hands/handsSlice';
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


type PokerAction = 'fold' | 'call' | 'raise' | 'bet' | 'check';


const HandTracker: React.FC = () => {
  
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const [selectedCards, setSelectedCards] = useState<CardType[]>([]);
  const [position, setPosition] = useState('');
  const [pot, setPot] = useState('');
  const [action, setAction] = useState<PokerAction>('fold');
  const [street, setStreet] = useState<Street>('preflop');

  const actionIcons = {
    fold: <FoldIcon />,
    call: <CallIcon />,
    raise: <RaiseIcon />,
    bet: <BetIcon />,
    check: <CheckIcon />,
  };

  const handleActionChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (isValidAction(newValue)) {
      setAction(newValue);
    }
  };

  const isValidAction = (value: string): value is PokerAction => {
    return ['fold', 'call', 'raise', 'bet', 'check'].includes(value);
  };

  
  const formAnimation = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
  });

  const handleCardSelect = (card: CardType) => {
    if (selectedCards.length < 2) {
      setSelectedCards([...selectedCards, card]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCards.length !== 2) return;

    const newHand: Hand = {
      id: '',
      street: undefined,
      userId: user?.uid,
      cards: selectedCards,
      position,
      action,
      pot: Number(pot),
      result: 0,
      timestamp: Date.now(),
    };

    try {
      const handRef = await push(ref(database, `hands/${user?.uid}`), newHand);
      newHand.id = handRef.key || '';
      dispatch(addHand(newHand));
      
      setSelectedCards([]);
      setPosition('');
      setPot('');
      setAction('fold');
    } catch (error) {
      console.error('Error saving hand:', error);
    }
  };

  return (
    <animated.div style={formAnimation}>
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h5" gutterBottom>
          Enregistrer une nouvelle main
        </Typography>
        <form onSubmit={handleSubmit}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Sélectionnez vos cartes
            </Typography>
            <CardSelector
              selectedCards={selectedCards}
              onCardSelect={handleCardSelect}
            />
          </Box>

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

          <FormControl fullWidth sx={{ mb: 2 }}>
  <InputLabel>Tour de jeu</InputLabel>
  <Select
    value={street}
    onChange={(e) => setStreet(e.target.value as Street)}
    required
  >
    <MenuItem value="preflop">Preflop</MenuItem>
    <MenuItem value="flop">Flop</MenuItem>
    <MenuItem value="turn">Turn</MenuItem>
    <MenuItem value="river">River</MenuItem>
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
  </FormControl>

          <Button
            variant="contained"
            type="submit"
            fullWidth
            disabled={selectedCards.length !== 2}
          >
            Enregistrer la main
          </Button>
        </form>
      </Paper>
    </animated.div>
  );
};

export default HandTracker;