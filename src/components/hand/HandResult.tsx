import React from 'react';
import { 
  Box, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem 
} from '@mui/material';

interface HandResultProps {
  result: number;
  onResultChange: (result: number) => void;
  showdown: boolean;
  onShowdownChange: (showdown: boolean) => void;
}

const HandResult: React.FC<HandResultProps> = ({
  result,
  onResultChange,
  showdown,
  onShowdownChange
}) => {
  return (
    <Box sx={{ mt: 2 }}>
      <TextField
        fullWidth
        label="Résultat (BB)"
        type="number"
        value={result}
        onChange={(e) => onResultChange(Number(e.target.value))}
        sx={{ mb: 2 }}
      />
      <FormControl fullWidth>
        <InputLabel>Showdown</InputLabel>
        <Select
          value={showdown}
          onChange={(e) => onShowdownChange(e.target.value === 'true')}
        >
          <MenuItem value="true">Oui</MenuItem>
          <MenuItem value="false">Non</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

export default HandResult;