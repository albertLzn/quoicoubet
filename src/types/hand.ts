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
