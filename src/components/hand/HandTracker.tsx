import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Button, TextField, FormControl, InputLabel, Select, MenuItem, 
  Paper, ListItemIcon, Stepper, Step, StepLabel, FormControlLabel,
  Checkbox, Dialog, DialogTitle, DialogContent, DialogActions,
  Typography, Grid, Drawer,
  Snackbar,
  IconButton
} from '@mui/material';
import {
  CallEnd as FoldIcon, Call as CallIcon, TrendingUp as RaiseIcon,
  Casino as BetIcon, RadioButtonUnchecked as CheckIcon, Settings
} from '@mui/icons-material';
import { useSpring, animated } from 'react-spring';
import { Card, PokerRound } from '../../types/hand';
import { database } from '../../config/firebase';
import { ref, push } from 'firebase/database';
import { RootState } from '../../store';
import { addRound } from '../../features/rounds/roundsSlice';
import PokerRangeTable from '../PokerRangeTable';
import { CardValue, Position } from '../../types/poker';
import { Close as CloseIcon } from '@mui/icons-material';

type PokerAction = 'fold' | 'call' | 'raise' | 'bet' | 'check';
type Suit = 'hearts' | 'diamonds' | 'spades' | 'clubs';

const actionIcons = {
  fold: <FoldIcon />,
  call: <CallIcon />,
  raise: <RaiseIcon />,
  bet: <BetIcon />,
  check: <CheckIcon />,
};

const CardSlot: React.FC<{
  card: Card | null;
  onClick: () => void;
}> = ({ card, onClick }) => (
  <Paper
    sx={{
      width: 60,
      height: 90,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: card ? 'white' : 'rgba(255,255,255,0.1)'
    }}
    onClick={onClick}
  >
    {card && (
      <Typography 
        sx={{ 
          color: ['hearts', 'diamonds'].includes(card.suit) ? 'red' : 'black'
        }}
      >
        {card.value}{card.suit.charAt(0)}
      </Typography>
    )}
  </Paper>
);

const CardSelectorDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  selectedCards: Card[];
  onCardSelect: (card: Card) => void;
}> = ({ open, onClose, selectedCards, onCardSelect }) => {
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const values = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
  const suits: Suit[] = ['hearts', 'diamonds', 'spades', 'clubs'];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Sélectionner une carte</DialogTitle>
      <DialogContent>
        <Grid container spacing={1}>
          {values.map((value) => (
            <Grid item key={value} xs={2}>
              <Button
                variant={selectedValue === value ? 'contained' : 'outlined'}
                onClick={() => setSelectedValue(value)}
                fullWidth
              >
                {value}
              </Button>
            </Grid>
          ))}
        </Grid>
        
        {selectedValue && (
          <Grid container spacing={2} sx={{ mt: 2 }}>
            {suits.map((suit) => {
              const isDisabled = selectedCards.some(
                card => card.value === selectedValue && card.suit === suit
              );
              return (
                <Grid item xs={6} key={suit}>
                  <Button
                    variant="contained"
                    fullWidth
                    disabled={isDisabled}
                    onClick={() => onCardSelect({ value: selectedValue, suit })}
                    sx={{
                      color: ['hearts', 'diamonds'].includes(suit) ? 'red' : 'black',
                      opacity: isDisabled ? 0.5 : 1
                    }}
                  >
                    {suit}
                  </Button>
                </Grid>
              );
            })}
          </Grid>
        )}
      </DialogContent>
    </Dialog>
  );
};

const HandTracker: React.FC = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  
  // États partagés entre le drawer et la vue principale
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [position, setPosition] = useState('');
  const [action, setAction] = useState<PokerAction>('fold');
  const [pot, setPot] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [result, setResult] = useState<number>(0);
  const [isWin, setIsWin] = useState(false);
  const [stackSize, setStackSize] = useState<number>(0);
  const [blindLevel, setBlindLevel] = useState<string>('');
  const [sessionId] = useState<string>(Date.now().toString());
  const [priceToCall, setPriceToCall] = useState<number>(0);

  // États de l'interface
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [cardSelectorOpen, setCardSelectorOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [communityCards, setCommunityCards] = useState<(Card | null)[]>([null, null, null, null, null]);
  const [openPredictions, setOpenPredictions] = useState(false);

  const [showPredictionSnack, setShowPredictionSnack] = useState(false);


  const [roundData, setRoundData] = useState<PokerRound>({
    id: '',
    userId: user?.uid,
    cards: [],
    position: '',
    timestamp: Date.now(),
    streets: {},
    stackSize: 0,
    blindLevel: '',
    sessionId: Date.now().toString()
  });

  const steps = ['Preflop', 'Flop', 'Turn', 'River'];
  const canShowPredictions = selectedCards.length === 2 && position && stackSize > 0;

  const handleSaveRound = async () => {
    const currentStreet = steps[activeStep].toLowerCase();
    const updatedRoundData = {
      ...roundData,
      cards: selectedCards,
      position,
      stackSize,
      blindLevel,
      sessionId: sessionId || Date.now().toString(),
      streets: {
        ...roundData.streets,
        [currentStreet]: {
          action,
          pot: Number(pot),
          timestamp: Date.now(),
          result: isWin ? 1 : -1,
          isThreeBet: false,
          isCBet: false,
        }
      }
    };

    try {
      const roundRef = await push(ref(database, `rounds/${user?.uid}`), updatedRoundData);
      if (roundRef.key) {
        dispatch(addRound({ ...updatedRoundData, id: roundRef.key }));
        setSelectedCards([]);
        setCommunityCards([null, null, null, null, null]);
        setPosition('');
        setPot('');
        setAction('fold');
        setActiveStep(0);
      }
    } catch (error) {
      console.error('Error saving round:', error);
    }
  };

  useEffect(() => {
    setShowPredictionSnack(Boolean(canShowPredictions));
  }, [canShowPredictions]);
  

  // Composants de formulaire partagés
  const GameOptionsForm = ({ inDrawer = false }) => (
    <Box sx={{ width: inDrawer ? 300 : '100%', p: inDrawer ? 2 : 0 }}>
      {inDrawer && <Typography variant="h6" gutterBottom>Options de jeu</Typography>}
      
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Position</InputLabel>
        <Select
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          size={inDrawer ? "medium" : "small"}
        >
          <MenuItem value="BB">Big Blind</MenuItem>
          <MenuItem value="SB">Small Blind</MenuItem>
          <MenuItem value="BTN">Button</MenuItem>
          <MenuItem value="CO">Cutoff</MenuItem>
          <MenuItem value="MP">Middle Position</MenuItem>
          <MenuItem value="UTG">Under the Gun</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Niveau de Blinds</InputLabel>
        <Select
          value={blindLevel}
          onChange={(e) => setBlindLevel(e.target.value)}
          size={inDrawer ? "medium" : "small"}
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

      <TextField
        fullWidth
        label="Stack size (BB)"
        type="number"
        value={stackSize}
        onChange={(e) => setStackSize(Number(e.target.value))}
        size={inDrawer ? "medium" : "small"}
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        label="Taille du pot"
        type="number"
        value={pot}
        onChange={(e) => setPot(e.target.value)}
        size={inDrawer ? "medium" : "small"}
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        label="Prix pour suivre (BB)"
        type="number"
        value={priceToCall}
        onChange={(e) => setPriceToCall(Number(e.target.value))}
        size={inDrawer ? "medium" : "small"}
        sx={{ mb: 2 }}
      />

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Action</InputLabel>
        <Select
          value={action}
          onChange={(e) => setAction(e.target.value as PokerAction)}
          size={inDrawer ? "medium" : "small"}
        >
          {Object.entries(actionIcons).map(([key, icon]) => (
            <MenuItem key={key} value={key}>
              <ListItemIcon>{icon}</ListItemIcon>
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>


      

      {inDrawer && (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        gap: 2, 
        mt: 2,
        borderTop: 1,
        borderColor: 'divider',
        pt: 2
      }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={isWin}
              onChange={(e) => {
                setIsWin(e.target.checked);
                setResult(e.target.checked ? 1 : -1);
              }}
            />
          }
          label="Round gagné"
        />
        <Button 
          variant="outlined"
          onClick={handleSaveRound}
          disabled={!position || !pot || selectedCards.length !== 2}
          fullWidth
        >
          Enregistrer
        </Button>
        {activeStep < steps.length - 1 && (
          <Button 
            variant="contained"
            onClick={() => {
              const currentStreet = steps[activeStep].toLowerCase();
              setRoundData(prev => ({
                ...prev,
                streets: {
                  ...prev.streets,
                  [currentStreet]: {
                    action,
                    pot: Number(pot),
                    timestamp: Date.now(),
                    result: isWin ? 1 : -1,
                    isThreeBet: false,
                    isCBet: false
                  }
                }
              }));
              setActiveStep(prev => prev + 1);
              setPot('');
              setAction('fold');
              setDrawerOpen(false);
            }}
            fullWidth
          >
            Suivant
          </Button>
        )}
      </Box>
    )}

    </Box>
  );

  return (
<Box sx={{ 
  height: '90vh', // Adapte à toute la hauteur de l'écran
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#2a503d', // Fond global sombre pour un bon contraste
}}>
  <Box sx={{
    width: { xs: '90%', sm: '80%', md: '70%' }, // Largeur adaptable
    height: { xs: '80%', sm: '70%', md: '60%' }, // Hauteur adaptable
    backgroundColor: '#35654d', // Couleur principale
    border: '15px solid #2a503d', // Bordure épaisse pour l'effet tapis
    borderRadius: '12px',
    position: 'relative',
    boxShadow: 'inset 0 0 15px rgba(0,0,0,0.3), 0 0 15px rgba(0,0,0,0.2)', // Ombres pour la profondeur
    background: 'radial-gradient(circle, rgba(53,101,77,0.9) 0%, rgba(47,91,69,1) 80%)', // Dégradé radial élégant
    overflow: 'hidden', // Pour gérer les débordements
    display: 'flex', // Conteneur pour ajouter des éléments facilement
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-evenly', // Espace les éléments uniformément
  }}>
      <Box sx={{ display: 'flex', gap: 2, width: '100%', justifyContent: 'center' }}>
        <TextField
          size="small"
          type="number"
          value={pot}
          onChange={(e) => setPot(e.target.value)}
          label="Taille du pot"
          sx={{ width: '175px' }}
        />
        <TextField
          size="small"
          type="number"
          value={priceToCall}
          onChange={(e) => setPriceToCall(Number(e.target.value))}
          label="Prix pour suivre (BB)"
          sx={{ width: '175px' }}
        />
      </Box>

      {/* Ligne 2: Stepper */}
      <Stepper sx={{ width: '80%' }} activeStep={activeStep}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Ligne 3: Cartes communautaires */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        {communityCards.map((card, index) => (
          <CardSlot
            key={index}
            card={card}
            onClick={() => {
              setSelectedSlot(index);
              setCardSelectorOpen(true);
            }}
          />
        ))}
      </Box>

      {/* Ligne 4: Blinds et Position */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <FormControl sx={{ width: '120px' }}>
          <Select
            value={blindLevel}
            onChange={(e) => setBlindLevel(e.target.value)}
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
        <FormControl sx={{ width: '200px' }}>
          <Select
            value={position}
            onChange={(e) => setPosition(e.target.value)}
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
      </Box>

      {/* Ligne 5: Action */}
      <FormControl sx={{ width: '200px' }}>
        <Select
          value={action}
          onChange={(e) => setAction(e.target.value as PokerAction)}
          size="small"
        >
          {Object.entries(actionIcons).map(([key, icon]) => (
            <MenuItem key={key} value={key}>
              <ListItemIcon>{icon}</ListItemIcon>
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Ligne 6: Cartes du joueur */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        {[0, 1].map((index) => (
          <CardSlot
            key={`player-${index}`}
            card={selectedCards[index] || null}
            onClick={() => {
              setSelectedSlot(index + 5);
              setCardSelectorOpen(true);
            }}
          />
        ))}
      </Box>

      </Box>

<Box sx={{ 
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: 'background.paper',
  borderTop: 1,
  borderColor: 'divider',
  p: 2,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 2
}}>
  {/* Groupe de gauche */}
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
    <Button 
      variant="contained"
      onClick={() => setDrawerOpen(true)}
      startIcon={<Settings />}
    >
      Options
    </Button>


  </Box>

  {/* Groupe central */}
  <Box sx={{ display: 'flex', gap: 2 }}>
            {/* Stack size */}
            <TextField
      size="small"
      type="number"
      value={stackSize}
      onChange={(e) => setStackSize(Number(e.target.value))}
      label="Stack (BB)"
    />
  </Box>

  {/* Groupe de droite */}
  <Box sx={{ display: 'flex', gap: 2 }}>
  <FormControlLabel
      control={
        <Checkbox
          checked={isWin}
          onChange={(e) => {
            setIsWin(e.target.checked);
            setResult(e.target.checked ? 1 : -1);
          }}
        />
      }
      label="I won"
    />
    <Button 
      variant="outlined"
      onClick={handleSaveRound}
      disabled={!position || !pot || selectedCards.length !== 2}
    >
      Enregistrer
    </Button>
    {activeStep < steps.length - 1 && (
      <Button 
        variant="contained"
        onClick={() => {
          const currentStreet = steps[activeStep].toLowerCase();
          setRoundData(prev => ({
            ...prev,
            streets: {
              ...prev.streets,
              [currentStreet]: {
                action,
                pot: Number(pot),
                timestamp: Date.now(),
                result: isWin ? 1 : -1,
                isThreeBet: false,
                isCBet: false
              }
            }
          }));
          setActiveStep(prev => prev + 1);
          setPot('');
          setAction('fold');
        }}
      >
        Suivant
      </Button>
    )}
  </Box>
</Box>
      {/* Dialogs et Drawer */}
      <CardSelectorDialog
        open={cardSelectorOpen}
        onClose={() => setCardSelectorOpen(false)}
        selectedCards={[...selectedCards, ...communityCards.filter((c): c is Card => c !== null)]}
        onCardSelect={(card) => {
          if (selectedSlot !== null) {
            if (selectedSlot >= 5) {
              const newSelectedCards = [...selectedCards];
              newSelectedCards[selectedSlot - 5] = card;
              setSelectedCards(newSelectedCards);
            } else {
              const newCommunityCards = [...communityCards];
              newCommunityCards[selectedSlot] = card;
              setCommunityCards(newCommunityCards);
            }
          }
          setCardSelectorOpen(false);
        }}
      />

      {/* Dialog des prédictions */}
      <Dialog
        open={openPredictions}
        onClose={() => setOpenPredictions(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Analyse de Range</DialogTitle>
        <DialogContent>
          <PokerRangeTable
            card1={selectedCards[0]?.value as CardValue}
            card2={selectedCards[1]?.value as CardValue}
            position={position as Position}
            stack={stackSize}
            remainingPlayers={2}
            tendency="neutral"
            priceToCall={priceToCall}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPredictions(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>

      {/* Drawer des options */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <GameOptionsForm inDrawer={true} />
      </Drawer>

      <Snackbar
  open={showPredictionSnack}
  anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
  message="Predictions available !"
  action={
    <>
      <Button
        color="secondary"
        size="small"
        onClick={() => setOpenPredictions(true)}
      >
        Open prediction
      </Button>
      {/* <IconButton
        size="small"
        color="inherit"
        onClick={() => setShowPredictionSnack(false)}
      >
        <CloseIcon fontSize="small" />
      </IconButton> */}
    </>
  }
/>
    </Box>

    
  );
};

export default HandTracker;