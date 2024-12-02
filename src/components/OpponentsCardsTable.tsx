import { useState } from "react";
import { Card } from "../types/hand";
import { Box, Dialog, DialogContent, DialogTitle, Paper, Typography } from "@mui/material";
import CardSelectorDialog from "./hand/CardSelectorDialog";

// components/OpponentsCardsTable.tsx
interface OpponentsCardsTableProps {
    open: boolean;
    onClose: () => void;
    remainingPlayers: number;
    heroCards: Card[];
    opponentsCards: Card[][];
    onUpdateOpponentsCards: (cards: Card[][]) => void;
  }
  
  const OpponentsCardsTable: React.FC<OpponentsCardsTableProps> = ({
    open,
    onClose,
    remainingPlayers,
    heroCards,
    opponentsCards,
    onUpdateOpponentsCards
  }) => {
    const [cardSelectorOpen, setCardSelectorOpen] = useState(false);
    const [selectedPlayerIndex, setSelectedPlayerIndex] = useState<number | null>(null);
    const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
  
    const getPlayerPosition = (index: number, total: number) => {
      // Calcul des positions autour de la table
      const angle = (2 * Math.PI * index) / total;
      const radius = 150;
      return {
        left: `${Math.cos(angle) * radius + 200}px`,
        top: `${Math.sin(angle) * radius + 200}px`
      };
    };
  
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>Cartes des adversaires</DialogTitle>
        <DialogContent>
          <Box sx={{ 
            width: '100%', 
            height: '500px', 
            backgroundColor: '#35654d',
            borderRadius: '50%',
            position: 'relative',
            padding: 2
          }}>
            {/* Positions des adversaires */}
            {Array.from({ length: remainingPlayers - 1 }).map((_, index) => (
              <Box
                key={index}
                sx={{
                  position: 'absolute',
                  ...getPlayerPosition(index, remainingPlayers - 1)
                }}
              >
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {[0, 1].map((cardIndex) => (
                    <Paper
                      key={cardIndex}
                      sx={{
                        width: 60,
                        height: 90,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      onClick={() => {
                        setSelectedPlayerIndex(index);
                        setSelectedCardIndex(cardIndex);
                        setCardSelectorOpen(true);
                      }}
                    >
                      {opponentsCards[index]?.[cardIndex] ? (
                        <Typography>
                          {opponentsCards[index][cardIndex].value}
                          {opponentsCards[index][cardIndex].suit.charAt(0)}
                        </Typography>
                      ) : '?'}
                    </Paper>
                  ))}
                </Box>
              </Box>
            ))}
  
            {/* Cartes du héros */}
            <Box sx={{
              position: 'absolute',
              bottom: 20,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: 1
            }}>
              {heroCards.map((card, index) => (
                <Paper
                  key={index}
                  sx={{
                    width: 60,
                    height: 90,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: ['hearts', 'diamonds'].includes(card.suit) ? 'red' : 'black'
                  }}
                >
                  {card.value}{card.suit.charAt(0)}
                </Paper>
              ))}
            </Box>
          </Box>
        </DialogContent>
  
        <CardSelectorDialog
          open={cardSelectorOpen}
          onClose={() => setCardSelectorOpen(false)}
          selectedCards={opponentsCards.flat()}
          onCardSelect={(card) => {
            if (selectedPlayerIndex !== null && selectedCardIndex !== null) {
              const newOpponentsCards = [...opponentsCards];
              if (!newOpponentsCards[selectedPlayerIndex]) {
                newOpponentsCards[selectedPlayerIndex] = [];
              }
              newOpponentsCards[selectedPlayerIndex][selectedCardIndex] = card;
              onUpdateOpponentsCards(newOpponentsCards);
            }
            setCardSelectorOpen(false);
          }}
        />
      </Dialog>
    );
  };

  export default OpponentsCardsTable;