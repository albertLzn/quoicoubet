// SaveConfirmationDialog.tsx
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
  Chip,
  Stepper,
  ListItemIcon,
  Step,
  StepLabel,
  Tooltip
} from '@mui/material';
import { CheckCircle, Cancel, PlayArrow } from '@mui/icons-material';
import { Card, PokerAction, StreetAction } from '../types/hand';
import CardSelector from './hand/CardSelector';
import { actionIcons } from '../const/icons';
import CardSelectorDialog from './hand/CardSelectorDialog';
import { steps } from '../const/poker';

interface StepAction {
    action: string;
    pot: number;
  }

  interface SaveConfirmationDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: () => void;
    onSaveAndContinue: () => void;
    roundData: {
      cards: Card[];
      position: string;
      action: PokerAction;
      pot: string;
      stackSize: number;
      blindLevel: string;
      isWin: boolean;
      streets: {
        [key: string]: StreetAction;
      };
    };
    onUpdateData: (field: string, value: any) => void;
  }

const SaveConfirmationDialog: React.FC<SaveConfirmationDialogProps> = ({
  open,
  onClose,
  onSave,
  onSaveAndContinue,
  roundData,
  onUpdateData
}) =>   { 
    const [selectedStep, setSelectedStep] = useState<number | null>(null);
const [actionSelectOpen, setActionSelectOpen] = useState(false);
const [cardSelectorOpen, setCardSelectorOpen] = useState(false);
const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
const handleStepClick = (index: number) => {
  setSelectedStep(index);
  setActionSelectOpen(true);
};
const handleActionChange = (newAction: string) => {
    if (selectedStep !== null) {
      onUpdateData(`streets.${selectedStep}.action`, newAction);
    }
    setActionSelectOpen(false);
  };
    return (( 
    
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
                bgcolor: 'primary.main',
                margin: 'auto',
                mb: 2
              }}
            >
              <CheckCircle sx={{ fontSize: 40 }} />
            </Avatar>
            Sauvegarder la main
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

// Modifier l'affichage des cartes pour permettre la sélection
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
  <Stepper sx={{
    '& .MuiStepLabel-label': {
      display: { xs: 'none', sm: 'block' }
    },
    '& .MuiStep-root': {
      px: { xs: 0, sm: 1 }
    }
  }}>
    {steps.map((label, index) => (
      <Step key={label} completed={index < Object.keys(roundData.streets).length}>
        <StepLabel
          onClick={() => handleStepClick(index)}
          sx={{ cursor: 'pointer' }}
          icon={
            roundData.streets[index] ? (
              <Tooltip title={`${roundData.streets[index].action.toUpperCase()} (${roundData.streets[index].pot} BB)`}>
                <Box sx={{ color: 'primary.main' }}>
                  {actionIcons[roundData.streets[index].action]}
                </Box>
              </Tooltip>
            ) : (
              index + 1
            )
          }
        >
          {roundData.streets[index] ? roundData.streets[index].action.toUpperCase() : label}
        </StepLabel>
      </Step>
    ))}
  </Stepper>
</Grid>

<Dialog
  open={actionSelectOpen}
  onClose={() => setActionSelectOpen(false)}
  maxWidth="xs"
  fullWidth
>
  <DialogTitle>Choisir une action</DialogTitle>
  <DialogContent>
    <FormControl fullWidth>
      <Select
        value={selectedStep !== null ? roundData.streets[selectedStep]?.action || '' : ''}
        onChange={(e) => handleActionChange(e.target.value)}
      >
        {Object.entries(actionIcons).map(([key, icon]) => (
          <MenuItem key={key} value={key}>
            <ListItemIcon>{icon}</ListItemIcon>
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  </DialogContent>
</Dialog>
      
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
              Valider
            </Button>
            <Button
              startIcon={<PlayArrow />}
              onClick={onSaveAndContinue}
              variant="contained"
              color="secondary"
            >
              Valider et continuer
            </Button>
          </DialogActions>
        </Dialog>
      ))
} 

export default SaveConfirmationDialog;  