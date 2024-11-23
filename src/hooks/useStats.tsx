import { useState, useEffect } from 'react';
import { Hand } from '../types/hand';
import { calculateVPIP, calculatePFR } from '../utils/pokerCalculations';

export const useStats = (hands: Hand[]) => {
  const [stats, setStats] = useState({
    totalHands: 0,
    totalProfit: 0,
    winRate: 0,
    bbPer100: 0,
    vpip: 0,
    pfr: 0,
    positionStats: {} as Record<string, { hands: number, profit: number }>,
  });

  useEffect(() => {
    if (!hands.length) return;

    const calculateStats = () => {
      const totalHands = hands.length;
      const totalProfit = hands.reduce((sum, hand) => sum + hand.result, 0);
      const winningHands = hands.filter(hand => hand.result > 0).length;

      const positionStats = hands.reduce((acc, hand) => {
        if (!acc[hand.position]) {
          acc[hand.position] = { hands: 0, profit: 0 };
        }
        acc[hand.position].hands++;
        acc[hand.position].profit += hand.result;
        return acc;
      }, {} as Record<string, { hands: number, profit: number }>);

      setStats({
        totalHands,
        totalProfit,
        winRate: (winningHands / totalHands) * 100,
        bbPer100: (totalProfit / totalHands) * 100,
        vpip: calculateVPIP(hands),
        pfr: calculatePFR(hands),
        positionStats,
      });
    };

    calculateStats();
  }, [hands]);

  return stats;
};