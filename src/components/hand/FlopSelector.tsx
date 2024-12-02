import React from 'react';
import { Grid, Typography } from '@mui/material';
import { Card as CardType } from '../../types/hand';
import CardSelector from './CardSelector';

interface FlopSelectorProps {
  flop: CardType[];
  onFlopSelect: (cards: CardType[]) => void;
}

const FlopSelector: React.FC<FlopSelectorProps> = ({ flop, onFlopSelect }) => {
  const handleCardSelect = (card: CardType) => {
    if (flop.length < 3) {
      onFlopSelect([...flop, card]);
    }
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h6">Flop</Typography>
        <CardSelector 
          selectedCards={flop}
          onCardSelect={handleCardSelect}
        />
      </Grid>
    </Grid>
  );
};

export default FlopSelector;