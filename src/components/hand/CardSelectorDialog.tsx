import { useState } from "react";
import { Card } from "../../types/hand";
import { Button, Dialog, DialogContent, DialogTitle, Grid } from "@mui/material";
type Suit = 'hearts' | 'diamonds' | 'spades' | 'clubs';

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
              {suits.map((suit, index) => {
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

  export default CardSelectorDialog;