import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Typography,
  Box,
  Paper,
  FormControlLabel,
  Checkbox,
  Avatar,
  Stepper,
  Step,
  StepLabel,
  Tooltip
} from '@mui/material';
import { CheckCircle, Cancel, PlayArrow, Edit } from '@mui/icons-material';
import { Card, PokerAction, StreetAction } from '../types/hand';
import { actionIcons } from '../const/icons';
import CardSelectorDialog from './hand/CardSelectorDialog';
import { steps } from '../const/poker';

interface SaveConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  onSaveAndContinue?: () => void;
  roundData: {
    cards: Card[];
    position: string;
    action: PokerAction;
    pot: string;
    stackSize: number;
    blindLevel: string;
    isWin: boolean;
    streets: { [key: string]: StreetAction };
  };
  onUpdateData: (field: string, value: any) => void;
  mode: 'create' | 'edit';
}

const SaveConfirmationDialog: React.FC<SaveConfirmationDialogProps> = ({
  open,
  onClose,
  onSave,
  onSaveAndContinue,
  roundData,
  onUpdateData,
  mode
}) => {
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const [actionSelectOpen, setActionSelectOpen] = useState(false);
  const [cardSelectorOpen, setCardSelectorOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

  const handleStepClick = (index: number) => {
    setSelectedStep(index);
    setActionSelectOpen(true);
  };

  const handleActionChange = (newAction: PokerAction) => {
    if (selectedStep !== null) {
      onUpdateData(`streets.${steps[selectedStep].toLowerCase()}.action`, newAction);
    }
    setActionSelectOpen(false);
  };

  return (
    <Dialog
      open={open}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 2
        }
      }}
    >
      <DialogTitle sx={{ textAlign: 'center' }}>
        <Avatar
          sx={{
            width: 60,
            height: 60,
            bgcolor: mode === 'create' ? 'primary.main' : 'secondary.main',
            margin: 'auto',
            mb: 2
          }}
        >
          {mode === 'create' ? <CheckCircle sx={{ fontSize: 40 }} /> : <Edit sx={{ fontSize: 40 }} />}
        </Avatar>
        {mode === 'create' ? 'Sauvegarder la main' : 'Modifier la main'}
      </DialogTitle>

      <DialogContent>
        <Grid container spacing={3}>
          <CardSelectorDialog
            open={cardSelectorOpen}
            onClose={() => setCardSelectorOpen(false)}
            selectedCards={roundData.cards}
            onCardSelect={(card) => {
              if (selectedSlot !== null) {
                const newCards = [...roundData.cards];
                newCards[selectedSlot] = card;
                onUpdateData('cards', newCards);
              }
              setCardSelectorOpen(false);
            }}
          />

          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>Main</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {[0, 1].map((index) => (
                <Paper
                  key={index}
                  sx={{
                    p: 1,
                    cursor: 'pointer',
                    color: roundData.cards[index] ?
                      ['hearts', 'diamonds'].includes(roundData.cards[index].suit) ? 'red' : 'black'
                      : 'text.disabled'
                  }}
                  onClick={() => {
                    setSelectedSlot(index);
                    setCardSelectorOpen(true);
                  }}
                >
                  {roundData.cards[index]
                    ? `${roundData.cards[index].value}${roundData.cards[index].suit.charAt(0)}`
                    : '?'
                  }
                </Paper>
              ))}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Stepper>
              {steps.map((label, index) => (
                <Step key={label} completed={index < Object.keys(roundData.streets).length}>
                  <StepLabel
                    onClick={() => handleStepClick(index)}
                    sx={{ cursor: 'pointer' }}
                    icon={
                      roundData.streets[label.toLowerCase()] ? (
                        <Tooltip title={`${roundData.streets[label.toLowerCase()].action.toUpperCase()} (${roundData.streets[label.toLowerCase()].pot} BB)`}>
                          <Box sx={{ color: 'primary.main' }}>
                            {actionIcons[roundData.streets[label.toLowerCase()].action]}
                          </Box>
                        </Tooltip>
                      ) : (
                        index + 1
                      )
                    }
                  >
                    {roundData.streets[label.toLowerCase()] ? roundData.streets[label.toLowerCase()].action.toUpperCase() : label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Grid>

          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Position</InputLabel>
              <Select
                value={roundData.position}
                onChange={(e) => onUpdateData('position', e.target.value)}
                size="small"
              >
                <MenuItem value="BB">Big Blind</MenuItem>
                <MenuItem value="SB">Small Blind</MenuItem>
                <MenuItem value="BTN">Button</MenuItem>
                <MenuItem value="CO">Cutoff</MenuItem>
                <MenuItem value="MP">Middle Position</MenuItem>
                <MenuItem value="UTG">Under the Gun</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Niveau de Blinds</InputLabel>
              <Select
                value={roundData.blindLevel}
                onChange={(e) => onUpdateData('blindLevel', e.target.value)}
                size="small"
              >
                <MenuItem value="2/4">2/4</MenuItem>
                <MenuItem value="5/10">5/10</MenuItem>
                <MenuItem value="10/20">10/20</MenuItem>
                <MenuItem value="20/40">20/40</MenuItem>
                <MenuItem value="25/50">25/50</MenuItem>
                <MenuItem value="50/100">50/100</MenuItem>
                <MenuItem value="100/200">100/200</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Stack Size (BB)"
              type="number"
              value={roundData.stackSize}
              onChange={(e) => onUpdateData('stackSize', Number(e.target.value))}
              size="small"
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Taille du pot"
              type="number"
              value={roundData.pot}
              onChange={(e) => onUpdateData('pot', e.target.value)}
              size="small"
            />
          </Grid>

          <Grid item xs={12}>
            <Paper
              elevation={3}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: roundData.isWin ? 'success.light' : 'background.paper',
                transition: 'background-color 0.3s'
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={roundData.isWin}
                    onChange={(e) => onUpdateData('isWin', e.target.checked)}
                    color="success"
                  />
                }
                label={
                  <Typography variant="h6" sx={{ color: roundData.isWin ? 'success.contrastText' : 'text.primary' }}>
                    Round gagné
                  </Typography>
                }
              />
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 2 }}>
        <Button
          startIcon={<Cancel />}
          onClick={onClose}
          variant="outlined"
          color="error"
        >
          Annuler
        </Button>
        <Button
          startIcon={<CheckCircle />}
          onClick={onSave}
          variant="contained"
          color="primary"
        >
          {mode === 'create' ? 'Valider' : 'Modifier'}
        </Button>
        {mode === 'create' && onSaveAndContinue && (
          <Button
            startIcon={<PlayArrow />}
            onClick={onSaveAndContinue}
            variant="contained"
            color="secondary"
          >
            Valider et continuer
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default SaveConfirmationDialog;