import { Box, CircularProgress, Typography } from "@mui/material";
import { evaluateHand, PokerHand, PokerRound } from "../types/hand";

// Nouveau composant pour afficher la probabilité
const ProbabilityCircle: React.FC<{ probability: number }> = ({ probability }) => {
    return (
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        <CircularProgress
          variant="determinate"
          value={probability}
          size={60}
          sx={{
            color: (theme) => 
              probability > 70 ? theme.palette.success.main :
              probability > 40 ? theme.palette.warning.main :
              theme.palette.error.main
          }}
        />
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
            {`${Math.round(probability)}%`}
          </Typography>
        </Box>
      </Box>
    );
  };
  
  // Fonction pour calculer la probabilité
  const calculateWinProbability = (round: PokerRound): number => {
    const lastStreet = Object.values(round.streets).pop();
    if (!lastStreet) return 0;
  
    // Facteurs qui influencent la probabilité
    let probability = 50; // Base de 50%
  
    // Position adjustment
    const positionBonus = {
      'BTN': 10,
      'CO': 8,
      'MP': 5,
      'UTG': 2,
      'BB': -2,
      'SB': -5
    }[round.position] || 0;
    probability += positionBonus;
  
    // Nombre de joueurs restants
    probability -= (lastStreet.remainingPlayers - 2) * 5;
  
    // Qualité de la main
    if (round.cards.length === 2) {
      const [card1, card2] = round.cards;
      // Paire
      if (card1.value === card2.value) {
        probability += 15;
      }
      // Suited
      if (card1.suit === card2.suit) {
        probability += 5;
      }
      // High cards
      const highCards = ['A', 'K', 'Q', 'J'];
      if (highCards.includes(card1.value) && highCards.includes(card2.value)) {
        probability += 10;
      }
    }
  
    // Community cards influence
    if (lastStreet.communityCards?.length) {
      const { hand } = evaluateHand(round.cards, lastStreet.communityCards);
      const handBonus = {
        [PokerHand.ROYAL_FLUSH]: 95,
        [PokerHand.STRAIGHT_FLUSH]: 90,
        [PokerHand.FOUR_OF_KIND]: 85,
        [PokerHand.FULL_HOUSE]: 80,
        [PokerHand.FLUSH]: 75,
        [PokerHand.STRAIGHT]: 70,
        [PokerHand.THREE_OF_KIND]: 65,
        [PokerHand.TWO_PAIR]: 60,
        [PokerHand.PAIR]: 55,
        [PokerHand.HIGH_CARD]: 45
      }[hand];
      probability = handBonus || probability;
    }
  
    // Limiter entre 0 et 100
    return Math.min(Math.max(probability, 0), 100);
  };