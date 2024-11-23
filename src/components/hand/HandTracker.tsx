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
} from '@mui/material';
import { useSpring, animated } from 'react-spring';
import { Card as CardType, Hand } from '../../types/hand';
import { addHand } from '../../features/hands/handsSlice';
import CardSelector from './CardSelector';
import { database } from '../../config/firebase';
import { ref, push } from 'firebase/database';
import { RootState } from '../../store';

type PokerAction = 'fold' | 'call' | 'raise' | 'bet' | 'check';


const HandTracker: React.FC = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const [selectedCards, setSelectedCards] = useState<CardType[]>([]);
  const [position, setPosition] = useState('');
  const [pot, setPot] = useState('');
  const [action, setAction] = useState<PokerAction>('fold');


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
      street: 'preflop',
      userId: user.uid,
      cards: selectedCards,
      position,
      action,
      pot: Number(pot),
      result: 0,
      timestamp: Date.now(),
    };

    try {
      const handRef = await push(ref(database, `hands/${user.uid}`), newHand);
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

          <TextField
            fullWidth
            label="Taille du pot"
            type="number"
            value={pot}
            onChange={(e) => setPot(e.target.value)}
            sx={{ mb: 2 }}
            required
          />

          <TextField
            fullWidth
            label="Action"
            value={action}
            onChange={handleActionChange}
            sx={{ mb: 2 }}
            required
          />

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