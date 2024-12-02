import { CardValue, Position, RangeMatrix, Action } from '../types/poker';

const HAND_STRENGTHS: Record<string, number> = {
    'AA': 1.00, 'KK': 0.95, 'QQ': 0.90, 'JJ': 0.85, 'TT': 0.80,  // Valeurs inchangées
    'AK': 0.75, 'AQ': 0.70, 'AJ': 0.65, 'AT': 0.60,
    'KQ': 0.55, 'KJ': 0.50, 'QJ': 0.45,
    '99': 0.75, '88': 0.70, '77': 0.65,
    '66': 0.60, '55': 0.55, '44': 0.50, '33': 0.45, '22': 0.40
};

// Ajuster les multiplicateurs de position
const POSITION_MULTIPLIERS: Record<Position, number> = {
    'BTN': 1.2,    // Augmenté
    'CO': 1.1,     // Augmenté
    'MP': 0.9,
    'UTG': 0.8,
    'SB': 1.1,     // Augmenté
    'BB': 1.0      // Augmenté
};

const TENDENCY_MULTIPLIERS: Record<string, number> = {
  aggressive: 1.1, // Ajustement pour adversaires agressifs
  passive: 0.9,
  neutral: 1.0
};

interface RangeCell {
  action: Action; // 'fold' | 'call' | 'raise'
  frequency: number; // Probabilité de suivre cette action
  sizing?: number; // Taille de la mise en BB (optionnel)
}

export const calculateRangeMatrix = (
  position: Position,
  remainingPlayers: number,
  stack: number,
  tendency: 'neutral' | 'aggressive' | 'passive',
  priceToCall: number  // Paramètre manquant

): RangeMatrix => {
  const matrix: RangeMatrix = {} as RangeMatrix;
  const cards: CardValue[] = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];

  const stackPressure = Math.min(stack / 100, 1.2);
  const playerPressure = 1 - (remainingPlayers * 0.1);
  const tendencyMultiplier = TENDENCY_MULTIPLIERS[tendency];

  cards.forEach(card1 => {
    matrix[card1] = {} as Record<CardValue, RangeCell>;
    cards.forEach(card2 => {
      const handKey = card1 >= card2 ? card1 + card2 : card2 + card1;
      const isPair = card1 === card2;
      const isSuited = card1 !== card2;

      let baseStrength = HAND_STRENGTHS[handKey] || 
        (isPair ? 0.4 : isSuited ? 0.3 : 0.2);

      const positionMultiplier = POSITION_MULTIPLIERS[position];
      const finalScore = baseStrength * positionMultiplier * stackPressure * playerPressure * tendencyMultiplier;

      let action: Action;
      let frequency: number;
      let sizing: number;

// Modifier la logique de décision
if (finalScore > 0.6) {         // Seuil baissé de 0.8 à 0.6
    action = 'raise';
    frequency = 100;
    sizing = Math.max(2.5, Math.min(4, stack / 50)) * 2;
} else if (finalScore > 0.4) {  // Seuil baissé de 0.6 à 0.4
    action = 'call';
    frequency = 80;
    sizing = 0;
} else {
    action = 'fold';
    frequency = 100;
    sizing = 0;
}

      matrix[card1][card2] = { action, frequency, sizing };
    });
  });

  return matrix;
};

export const calculateRecommendation = (
    card1: CardValue,
    card2: CardValue,
    position: Position,
    remainingPlayers: number,
    stack: number,
    tendency: string,
    priceToCall: number
  ) => {
    const handKey = card1 >= card2 ? card1 + card2 : card2 + card1;
    const isPair = card1 === card2;
    const isSuited = card1 !== card2;
  
    const baseStrength = HAND_STRENGTHS[handKey] || 
      (isPair ? 0.4 : isSuited ? 0.3 : 0.2);
    
    // Calcul du ratio prix/stack
    const priceToStackRatio = priceToCall / stack;
    
    // Ajustement de la force en fonction du coût relatif
    const adjustedStrength = baseStrength * (1 - priceToStackRatio);
    
    const positionMultiplier = POSITION_MULTIPLIERS[position];
    const stackPressure = Math.min(stack / 100, 1.2);
    const playerPressure = 1 - (remainingPlayers * 0.1);
  
    const finalScore = adjustedStrength * positionMultiplier * stackPressure * playerPressure;
  
    // Décision basée sur le rapport force/coût
    if (finalScore > priceToStackRatio * 1.5) {
      return { 
        action: 'raise',
        sizing: Math.max(priceToCall * 2.5, stack * 0.1)
      };
    } else if (finalScore > priceToStackRatio) {
      return { action: 'call' };
    }
  
    return { action: 'fold' };
  };
