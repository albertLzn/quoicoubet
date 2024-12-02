import { Card, Hand, PokerHand } from '../types/hand';

export const calculateVPIP = (hands: Hand[]): number => {
  if (hands.length === 0) return 0;

  const voluntaryHands = hands.filter(hand => 
    hand.action === 'call' || 
    hand.action === 'raise' || 
    hand.action === 'bet'
  );

  return (voluntaryHands.length / hands.length) * 100;
};

export const calculatePFR = (hands: Hand[]): number => {
  if (hands.length === 0) return 0;

  const preflopRaises = hands.filter(hand => 
    hand.action === 'raise' && 
    hand.street === 'preflop'
  );

  return (preflopRaises.length / hands.length) * 100;
};

export const calculateAggression = (hands: Hand[]): number => {
  const aggressiveActions = hands.filter(hand => 
    hand.action === 'raise' || 
    hand.action === 'bet'
  ).length;

  const passiveActions = hands.filter(hand => 
    hand.action === 'call'
  ).length;

  return passiveActions === 0 ? aggressiveActions : aggressiveActions / passiveActions;
};

export const evaluateHand = (playerCards: Card[], communityCards: Card[]): {
  hand: PokerHand,
  matchingCards: Card[]
} => {
  const allCards = [...playerCards, ...communityCards.filter((c): c is Card => c !== null)];
  
  // Vérifie la quinte flush royale
  const royalFlush = checkRoyalFlush(allCards);
  if (royalFlush) return { hand: PokerHand.ROYAL_FLUSH, matchingCards: royalFlush };

  // Continue avec les autres vérifications...
  return { hand: PokerHand.HIGH_CARD, matchingCards: [] };
};

const checkRoyalFlush = (cards: Card[]): Card[] | null => {
  // First check if we have a flush
  const suits = cards.reduce((acc, card) => {
    acc[card.suit] = (acc[card.suit] || []).concat(card);
    return acc;
  }, {} as { [key: string]: Card[] });

  // Check each suit that has 5 or more cards
  for (const suitCards of Object.values(suits)) {
    if (suitCards.length >= 5) {
      // Check for royal values (10, J, Q, K, A)
      const royalValues = ['T', 'J', 'Q', 'K', 'A'];
      const hasAllRoyalValues = royalValues.every(value =>
        suitCards.some(card => card.value === value)
      );

      if (hasAllRoyalValues) {
        // Return the 5 cards that form the royal flush
        return suitCards.filter(card => royalValues.includes(card.value));
      }
    }
  }

  return null;
};