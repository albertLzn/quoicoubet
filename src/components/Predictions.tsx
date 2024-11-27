import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography,
  FormControl,
  Select,
  MenuItem,
  TextField,
  Grid
} from '@mui/material';
import PokerRangeTable from '../components/PokerRangeTable';
import { CardValue, Position } from '../types/poker';
import { Card } from '../types/hand';
import CardSelectorDialog from './hand/CardSelectorDialog';

const Predictions: React.FC = () => {
  // États pour les paramètres de simulation
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [position, setPosition] = useState<Position>('BTN');
  const [stackSize, setStackSize] = useState<number>(100);
  const [remainingPlayers, setRemainingPlayers] = useState<number>(6);
  const [tendency, setTendency] = useState<'neutral' | 'aggressive' | 'passive'>('neutral');
  const [priceToCall, setPriceToCall] = useState<number>(2);

  // États pour le sélecteur de cartes
  const [cardSelectorOpen, setCardSelectorOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

  const handleCardSelect = (card: Card) => {
    if (selectedSlot !== null) {
      const newSelectedCards = [...selectedCards];
      newSelectedCards[selectedSlot] = card;
      setSelectedCards(newSelectedCards);
    }
    setCardSelectorOpen(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Simulateur de Range
      </Typography>

      <Grid container spacing={3}>
        {/* Paramètres de simulation */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Configuration
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Sélection des cartes */}
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Cartes du joueur
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {[0, 1].map((index) => (
                    <Paper 
                      key={index}
                      sx={{ 
                        width: 60,
                        height: 90,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: selectedCards[index] ? 'white' : 'rgba(0,0,0,0.1)'
                      }}
                      onClick={() => {
                        setSelectedSlot(index);
                        setCardSelectorOpen(true);
                      }}
                    >
                      {selectedCards[index] && (
                        <Typography sx={{ 
                          color: ['hearts', 'diamonds'].includes(selectedCards[index].suit) ? 'red' : 'black'
                        }}>
                          {selectedCards[index].value}{selectedCards[index].suit.charAt(0)}
                        </Typography>
                      )}
                    </Paper>
                  ))}
                </Box>
              </Box>

              <FormControl fullWidth>
                <Typography variant="subtitle2" gutterBottom>Position</Typography>
                <Select
                  value={position}
                  onChange={(e) => setPosition(e.target.value as Position)}
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

              <TextField
                fullWidth
                label="Stack (BB)"
                type="number"
                value={stackSize}
                onChange={(e) => setStackSize(Number(e.target.value))}
                size="small"
              />

              <TextField
                fullWidth
                label="Joueurs restants"
                type="number"
                value={remainingPlayers}
                onChange={(e) => setRemainingPlayers(Number(e.target.value))}
                size="small"
                inputProps={{ min: 2, max: 9 }}
              />

              <TextField
                fullWidth
                label="Prix pour suivre (BB)"
                type="number"
                value={priceToCall}
                onChange={(e) => setPriceToCall(Number(e.target.value))}
                size="small"
              />

              <FormControl fullWidth>
                <Typography variant="subtitle2" gutterBottom>Tendance</Typography>
                <Select
                  value={tendency}
                  onChange={(e) => setTendency(e.target.value as 'neutral' | 'aggressive' | 'passive')}
                  size="small"
                >
                  <MenuItem value="neutral">Neutre</MenuItem>
                  <MenuItem value="aggressive">Agressive</MenuItem>
                  <MenuItem value="passive">Passive</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Paper>
        </Grid>

        {/* Table de range */}
        <Grid item xs={12} md={8}>
          <PokerRangeTable
            card1={selectedCards[0]?.value as CardValue}
            card2={selectedCards[1]?.value as CardValue}
            position={position}
            remainingPlayers={remainingPlayers}
            stack={stackSize}
            tendency={tendency}
            priceToCall={priceToCall}
          />
        </Grid>
      </Grid>

      <CardSelectorDialog
        open={cardSelectorOpen}
        onClose={() => setCardSelectorOpen(false)}
        selectedCards={selectedCards}
        onCardSelect={handleCardSelect}
      />
    </Box>
  );
};

export default Predictions;