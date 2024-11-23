import { Hand } from '../types/hand';

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