import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Drawer,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid
} from '@mui/material';
import { Settings } from '@mui/icons-material';
import { RootState } from '../../store';
import { Card, PokerRound } from '../../types/hand';
import { addRound } from '../../features/rounds/roundsSlice';
import { database } from '../../config/firebase';
import { ref, push } from 'firebase/database';
import PokerRangeTable from '../PokerRangeTable';
import { CardValue, Position } from '../../types/poker';

type Suit = 'hearts' | 'diamonds' | 'spades' | 'clubs';

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

const GameOptions: React.FC<{
  position: string;
  setPosition: (pos: string) => void;
  stackSize: number;
  setStackSize: (size: number) => void;
  blindLevel: string;
  setBlindLevel: (level: string) => void;
  priceToCall: number;
  setPriceToCall: (price: number) => void;
  onSave: () => void;
}> = ({ 
  position, setPosition, 
  stackSize, setStackSize,
  blindLevel, setBlindLevel,
  priceToCall, setPriceToCall,
  onSave 
}) => (
  <Box sx={{ width: 300, p: 2 }}>
    <Typography variant="h6" gutterBottom>Options de jeu</Typography>
    
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
        <MenuItem value="UTG">Under the Gun</MenuItem>
      </Select>
    </FormControl>

    <TextField
      fullWidth
      label="Stack size (BB)"
      type="number"
      value={stackSize}
      onChange={(e) => setStackSize(Number(e.target.value))}
      sx={{ mb: 2 }}
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

    <Button 
      variant="contained" 
      fullWidth 
      onClick={onSave}
    >
      Sauvegarder
    </Button>
  </Box>
);

const HandTracker: React.FC = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [cardSelectorOpen, setCardSelectorOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [communityCards, setCommunityCards] = useState<(Card | null)[]>([null, null, null, null, null]);
  
  const [position, setPosition] = useState('');
  const [stackSize, setStackSize] = useState(0);
  const [blindLevel, setBlindLevel] = useState('');
  const [priceToCall, setPriceToCall] = useState(0);
  const [openPredictions, setOpenPredictions] = useState(false);

  const canShowPredictions = selectedCards.length === 2 && position && stackSize > 0;

  const handleSaveRound = async () => {
    const roundData: PokerRound = {
      id: '',
      userId: user?.uid,
      cards: selectedCards,
      position,
      timestamp: Date.now(),
      streets: {
        preflop: {
          action: 'call',
          pot: priceToCall,
          timestamp: Date.now(),
          result: 0
        }
      },
      stackSize,
      blindLevel,
      sessionId: Date.now().toString()
    };

    try {
      const roundRef = await push(ref(database, `rounds/${user?.uid}`), roundData);
      if (roundRef.key) {
        dispatch(addRound({ ...roundData, id: roundRef.key }));
        setSelectedCards([]);
        setCommunityCards([null, null, null, null, null]);
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
      {/* Table de poker */}
      <Box sx={{ 
        position: 'absolute', 
        top: '50%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)',
        display: 'flex',
        gap: 2
      }}>
        {/* Cartes communautaires */}
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

      {/* Menu latéral */}
      <Button 
        variant="contained"
        sx={{ position: 'absolute', right: 20, top: 20 }}
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
          sx={{ position: 'absolute', right: 20, top: 80 }}
        >
          Prédictions
        </Button>
      )}

      {/* Sélecteur de carte */}
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

      {/* Drawer des options */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <GameOptions
          position={position}
          setPosition={setPosition}
          stackSize={stackSize}
          setStackSize={setStackSize}
          blindLevel={blindLevel}
          setBlindLevel={setBlindLevel}
          priceToCall={priceToCall}
          setPriceToCall={setPriceToCall}
          onSave={() => {
            handleSaveRound();
            setDrawerOpen(false);
          }}
        />
      </Drawer>

      {/* Dialog des prédictions */}
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
    </Box>
  );
};

export default HandTracker;