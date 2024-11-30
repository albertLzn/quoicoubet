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
