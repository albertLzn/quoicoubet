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

export type Street = 'preflop' | 'flop' | 'turn' | 'river';

export interface PokerRound {
  id: string;
  userId: string | undefined;
  cards: Card[];
  position: string;
  timestamp: number;
  streets: {
    preflop?: StreetAction;
    flop?: StreetAction;
    turn?: StreetAction;
    river?: StreetAction;
  };
}

export interface StreetAction {
  action: 'fold' | 'call' | 'raise' | 'bet' | 'check';
  pot: number;
  timestamp: number;
  result: number; // Gain/Perte en BB
}