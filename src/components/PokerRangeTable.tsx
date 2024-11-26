import React, { useMemo, useState } from 'react';
import { 
    Box,
  IconButton,
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import { Action, CardValue, Position, RangeMatrix } from '../types/poker';
import { calculateRangeMatrix, calculateRecommendation } from '../utils/rangeCalculator';
import { AddCircle, RemoveCircle } from '@mui/icons-material';

interface PokerRangeTableProps {
    card1: CardValue;
    card2: CardValue;
    position: Position;
    remainingPlayers?: number;
    stack?: number;
    tendency?: 'neutral' | 'aggressive' | 'passive';  // Ajout,
    priceToCall: number;

  }

const CARD_VALUES: CardValue[] = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];

const PokerRangeTable: React.FC<PokerRangeTableProps> = ({
  card1,
  card2,
  position,
  remainingPlayers = 9,
  stack = 100,
  tendency = 'neutral',
  priceToCall
}) => {
    const [players, setPlayers] = useState(remainingPlayers);
    const [currentPrice, setCurrentPrice] = useState(priceToCall);

    const rangeMatrix = useMemo(() => {
        return calculateRangeMatrix(position, players, stack, tendency, currentPrice);
      }, [position, players, stack, tendency, currentPrice]); // Ajout de currentPrice
      
      const recommendation = useMemo(() => {
        return calculateRecommendation(card1, card2, position, players, stack, tendency, currentPrice);
      }, [card1, card2, position, players, stack, tendency, currentPrice]); // Ajout de currentPrice

  const getCellColor = (action: Action) => {
    switch (action) {
      case 'raise': return 'rgba(76, 175, 80, 0.3)';
      case 'call': return 'rgba(33, 150, 243, 0.3)';
      case 'fold': return 'rgba(244, 67, 54, 0.3)';
      default: return 'transparent';
    }
  };


  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
<Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
  <Typography variant="h6" gutterBottom>
    Paramètres d'analyse
  </Typography>
  <Typography variant="body2" sx={{ mb: 2 }}>
    Position: <strong>{position}</strong> • 
    Stack: <strong>{stack} BB</strong> • 
    Main: <strong>{card1}{card2}</strong> • 
  </Typography>

  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2">Joueurs restants:</Typography>
            <IconButton 
              size="small" 
              onClick={() => setPlayers(prev => Math.max(2, prev - 1))}
            >
              <RemoveCircle />
            </IconButton>
            <Typography><strong>{players}</strong></Typography>
            <IconButton 
              size="small" 
              onClick={() => setPlayers(prev => Math.min(9, prev + 1))}
            >
              <AddCircle />
            </IconButton>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
  <Typography variant="body2">Prix pour suivre (BB):</Typography>
  <TextField
    size="small"
    type="number"
    value={currentPrice}
    onChange={(e) => setCurrentPrice(Math.max(0, Number(e.target.value)))}
    inputProps={{ 
      min: 0,
      style: { width: '60px' }
    }}
  />
</Box>
  
  <Typography variant="h6" gutterBottom>
    Recommandation
  </Typography>
  <Typography>
    Action recommandée: <strong>{recommendation.action.toUpperCase()}</strong>
    {recommendation.sizing && ` (${recommendation.sizing} BB)`}
  </Typography>
  
</Box>  
      <TableContainer>
        
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell />
              {CARD_VALUES.map(value => (
                <TableCell key={value} align="center">{value}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {CARD_VALUES.map(rowCard => (
              <TableRow key={rowCard}>
                <TableCell component="th" scope="row">
                  {rowCard}
                </TableCell>
                {CARD_VALUES.map(colCard => {
                  const cell = rangeMatrix[rowCard][colCard];
                  const isSelected = (rowCard === card1 || rowCard === card2 || 
                    colCard === card1 || colCard === card2);

                  return (
                    <Tooltip
                      key={`${rowCard}${colCard}`}
                      title={
                        <Typography>
                          {`${cell.action.toUpperCase()} ${cell.sizing ? `(${cell.sizing}BB)` : ''}`}
                          <br />
                          {`Frequency: ${cell.frequency}%`}
                        </Typography>
                      }
                    >
                      <TableCell 
                        align="center"
                        sx={{
                          backgroundColor: getCellColor(cell.action),
                          outline: isSelected ? '2px solid yellow' : 'none'
                        }}
                      >
                        {rowCard === colCard ? 'p' : 's'}
                      </TableCell>
                    </Tooltip>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default PokerRangeTable;