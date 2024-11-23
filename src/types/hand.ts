export interface Hand {
  id: string;
  userId: string;
  cards: Card[];
  position: string;
  action: 'fold' | 'call' | 'raise' | 'bet' | 'check';
  street: 'preflop' | 'flop' | 'turn' | 'river';
  pot: number;
  result: number;
  timestamp: number;
  notes?: string;
}

export interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  value: string;
}