import React from 'react';
import { Grid, Card, CardContent, Typography } from '@mui/material';
import { useSpring, animated } from 'react-spring';
import { Card as CardType } from '../../types/hand';

interface CardSelectorProps {
  selectedCards: CardType[];
  onCardSelect: (card: CardType) => void;
}

const CardSelector: React.FC<CardSelectorProps> = ({ selectedCards, onCardSelect }) => {
  const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
  const values = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'];

  const cardAnimation = useSpring({
    from: { transform: 'scale(0.9)', opacity: 0 },
    to: { transform: 'scale(1)', opacity: 1 },
  });

  return (
    <Grid container spacing={1}>
      {suits.map((suit) => (
        <Grid item xs={12} key={suit}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            {suit.toUpperCase()}
          </Typography>
          <Grid container spacing={1}>
            {values.map((value) => {
              const isSelected = selectedCards.some(
                (card) => card.suit === suit && card.value === value
              );
              return (
                <Grid item key={`${suit}-${value}`}>
                  <animated.div style={cardAnimation}>
                    <Card
                      sx={{
                        width: 40,
                        height: 60,
                        cursor: 'pointer',
                        backgroundColor: isSelected ? '#1976d2' : 'white',
                        color: isSelected ? 'white' : 'inherit',
                      }}
                      onClick={() => onCardSelect({ suit, value } as CardType)}
                    >
                      <CardContent sx={{ p: 1, textAlign: 'center' }}>
                        {value}
                      </CardContent>
                    </Card>
                  </animated.div>
                </Grid>
              );
            })}
          </Grid>
        </Grid>
      ))}
    </Grid>
  );
};

export default CardSelector;