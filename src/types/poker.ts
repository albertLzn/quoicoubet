export type CardValue = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K' | 'A';
export type Position = 'UTG' | 'MP' | 'CO' | 'BTN' | 'SB' | 'BB';
export type Action = 'fold' | 'call' | 'raise';

interface RangeCell {
  action: Action;
  frequency: number;
  sizing?: number;
}

export type RangeMatrix = Record<CardValue, Record<CardValue, RangeCell>>;