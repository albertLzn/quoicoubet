export interface Hand {
  id: string;
  userId: string | undefined;
  cards: Card[];
  position: string;
  action: 'fold' | 'call' | 'raise' | 'bet' | 'check';
  street: Street | undefined;
  pot: number;
  result: number;
  timestamp: number;
  notes?: string;
}

export interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  value: string;
}
export   type PokerAction = 'fold' | 'call' | 'raise' | 'bet' | 'check';

export type Street = 'preflop' | 'flop' | 'turn' | 'river';

export interface PokerRound {
  id: string;
  userId: string | undefined;
  cards: Card[];
  position: string;
  timestamp: number;
  streets: Streets; // Utiliser l'interface Streets existante
  stackSize: number;
  blindLevel: string;
  sessionId: string;
}

interface Streets {
  [key: string]: StreetAction;
}

export interface StreetAction {
  action: PokerAction;
  pot: number;
  result: number;
  isCBet: boolean;
  isThreeBet: boolean;
  communityCards?: Card[];
  remainingPlayers: number;  // Nouveau champ
  opponentsCards?: Card[][];  // Nouveau champ pour les cartes des adversaires
}


// types/hand.ts
export enum PokerHand {
  HIGH_CARD = 'HIGH_CARD',
  PAIR = 'PAIR', 
  TWO_PAIR = 'TWO_PAIR',
  THREE_OF_KIND = 'THREE_OF_KIND',
  STRAIGHT = 'STRAIGHT',
  FLUSH = 'FLUSH',
  FULL_HOUSE = 'FULL_HOUSE',
  FOUR_OF_KIND = 'FOUR_OF_KIND',
  STRAIGHT_FLUSH = 'STRAIGHT_FLUSH',
  ROYAL_FLUSH = 'ROYAL_FLUSH'
}

const cardValues = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];

const checkPair = (cards: Card[]): Card[] | null => {
  const pairs = cards.filter((card1, i) => 
    cards.some((card2, j) => i < j && card1.value === card2.value)
  );
  return pairs.length >= 2 ? pairs.slice(0, 2) : null;
};

const checkTwoPair = (cards: Card[]): Card[] | null => {
  const pairs = cards.filter((card1, i) => 
    cards.some((card2, j) => i < j && card1.value === card2.value)
  );
  return pairs.length >= 4 ? pairs.slice(0, 4) : null;
};

const checkThreeOfKind = (cards: Card[]): Card[] | null => {
  for (const value of cardValues) {
    const matches = cards.filter(card => card.value === value);
    if (matches.length >= 3) return matches.slice(0, 3);
  }
  return null;
};

const checkStraight = (cards: Card[]): Card[] | null => {
  const values = cards.map(card => cardValues.indexOf(card.value))
    .sort((a, b) => a - b);
  
  for (let i = 0; i <= values.length - 5; i++) {
    if (values[i + 4] - values[i] === 4) {
      return cards.filter(card => 
        cardValues.indexOf(card.value) >= values[i] && 
        cardValues.indexOf(card.value) <= values[i + 4]
      ).slice(0, 5);
    }
  }
  return null;
};

const checkFlush = (cards: Card[]): Card[] | null => {
  const suits = cards.reduce((acc, card) => {
    acc[card.suit] = (acc[card.suit] || []).concat(card);
    return acc;
  }, {} as { [key: string]: Card[] });

  for (const suitCards of Object.values(suits)) {
    if (suitCards.length >= 5) return suitCards.slice(0, 5);
  }
  return null;
};

const checkFullHouse = (cards: Card[]): Card[] | null => {
  const three = checkThreeOfKind(cards);
  if (!three) return null;
  
  const remaining = cards.filter(card => !three.includes(card));
  const pair = checkPair(remaining);
  
  return pair ? [...three, ...pair] : null;
};

const checkFourOfKind = (cards: Card[]): Card[] | null => {
  for (const value of cardValues) {
    const matches = cards.filter(card => card.value === value);
    if (matches.length >= 4) return matches.slice(0, 4);
  }
  return null;
};

const checkStraightFlush = (cards: Card[]): Card[] | null => {
  const flush = checkFlush(cards);
  return flush ? checkStraight(flush) : null;
};

const checkRoyalFlush = (cards: Card[]): Card[] | null => {
  const straightFlush = checkStraightFlush(cards);
  if (!straightFlush) return null;
  
  const values = straightFlush.map(card => card.value);
  return values.includes('A') && values.includes('K') ? straightFlush : null;
};

export const evaluateHand = (playerCards: Card[], communityCards: Card[]): {
  hand: PokerHand,
  matchingCards: Card[]
} => {
  const allCards = [...playerCards, ...communityCards.filter((c): c is Card => c !== null)];
  
  const checks = [
    { check: checkRoyalFlush, hand: PokerHand.ROYAL_FLUSH },
    { check: checkStraightFlush, hand: PokerHand.STRAIGHT_FLUSH },
    { check: checkFourOfKind, hand: PokerHand.FOUR_OF_KIND },
    { check: checkFullHouse, hand: PokerHand.FULL_HOUSE },
    { check: checkFlush, hand: PokerHand.FLUSH },
    { check: checkStraight, hand: PokerHand.STRAIGHT },
    { check: checkThreeOfKind, hand: PokerHand.THREE_OF_KIND },
    { check: checkTwoPair, hand: PokerHand.TWO_PAIR },
    { check: checkPair, hand: PokerHand.PAIR }
  ];

  for (const { check, hand } of checks) {
    const matchingCards = check(allCards);
    if (matchingCards) {
      return { hand, matchingCards };
    }
  }

  return { 
    hand: PokerHand.HIGH_CARD, 
    matchingCards: [allCards.sort((a, b) => 
      cardValues.indexOf(b.value) - cardValues.indexOf(a.value)
    )[0]] 
  };
};