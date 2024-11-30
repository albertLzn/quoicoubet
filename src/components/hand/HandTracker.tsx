import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Button, TextField, FormControl, InputLabel, Select, MenuItem,
  Paper, ListItemIcon, Stepper, Step, StepLabel, FormControlLabel,
  Checkbox, Dialog, DialogTitle, DialogContent, DialogActions,
  Typography, Grid, Drawer,
  Snackbar,
  IconButton,
  Tooltip
} from '@mui/material';
import { Fab } from '@mui/material';
import { Analytics as PredictionIcon } from '@mui/icons-material';
import {
  Lock, LockOpen, Settings
} from '@mui/icons-material';
import { Close as CloseIcon } from '@mui/icons-material';


import { useSpring, animated } from 'react-spring';
import { Card, PokerAction, PokerRound } from '../../types/hand';
import { database } from '../../config/firebase';
import { ref, push } from 'firebase/database';
import { RootState } from '../../store';
import { addRound } from '../../features/rounds/roundsSlice';
import PokerRangeTable from '../PokerRangeTable';
import { CardValue, Position } from '../../types/poker';
import { actionIcons } from '../../const/icons';
import SaveConfirmationDialog from '../SaveConfirmationDialog';
import { steps } from '../../const/poker';

type Suit = 'hearts' | 'diamonds' | 'spades' | 'clubs';

// Nouveau composant pour l'animation de déverrouillage
const UnlockAnimation = () => {
  const animation = useSpring({
    from: { opacity: 1, transform: 'scale(1.5)', color: 'gold' },
    to: { opacity: 0, transform: 'scale(0)', color: 'gold' },
    config: { duration: 500 }
  });

  return (
    <animated.div
      style={{
        ...animation,
        position: 'absolute',
        zIndex: 2,
      }}
    >
      <LockOpen sx={{ fontSize: '2rem' }} />
    </animated.div>
  );
};

const CardSlot: React.FC<{
  card: Card | null;
  onClick: () => void;
  disabled: boolean;
  justUnlocked?: boolean;
}> = ({ card, onClick, disabled, justUnlocked }) => (
  <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    {justUnlocked && <UnlockAnimation />}
    <Paper
      sx={{
        width: 60,
        height: 90,
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: card ? 'white' : 'rgba(255,255,255,0.1)',
        opacity: disabled ? 0.5 : 1,
        position: 'relative',
        '&::after': disabled ? {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        } : {}
      }}
      onClick={() => !disabled && onClick()}
    >
      {card ? (
        <Typography sx={{
          color: ['hearts', 'diamonds'].includes(card.suit) ? 'red' : 'black'
        }}>
          {card.value}{card.suit.charAt(0)}
        </Typography>
      ) : disabled ? (
        <Lock sx={{ color: 'rgba(0,0,0,0.3)' }} />
      ) : null}
    </Paper>
  </Box>
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
  const [showPredictionFab, setShowPredictionFab] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);


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
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [cardSelectorOpen, setCardSelectorOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [communityCards, setCommunityCards] = useState<(Card | null)[]>([null, null, null, null, null]);
  const [openPredictions, setOpenPredictions] = useState(false);
  const [remainingPlayers, setRemainingPlayers] = useState(9);

  const [showPredictionSnack, setShowPredictionSnack] = useState(false);
  const getNextPosition = (currentPosition: string) => {
    const positions = ['UTG', 'MP', 'CO', 'BTN', 'SB', 'BB'];
    const currentIndex = positions.indexOf(currentPosition);
    return positions[(currentIndex + 1) % positions.length];
  };

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
          remainingPlayers,
          opponentsCards: [],
          communityCards: (() => {
            switch (currentStreet) {
              case 'flop':
                return communityCards.slice(0, 3).filter((card): card is Card => card !== null);
              case 'turn':
                return communityCards.slice(0, 4).filter((card): card is Card => card !== null);
              case 'river':
                return communityCards.slice(0, 5).filter((card): card is Card => card !== null);
              default:
                return undefined;
            }
          })()
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
  useEffect(() => {
    if (canShowPredictions) {
      setShowPredictionSnack(true);
      setShowPredictionFab(false);
    }
  }, [canShowPredictions]);

  // Composants de formulaire partagés
  const GameOptionsForm = ({ inDrawer = false }) => (
    <Box sx={{ width: inDrawer ? 300 : '100%', p: inDrawer ? 2 : 0 }}>
      {inDrawer && <>
        <Typography variant="h6" gutterBottom>Options de jeu</Typography>

        {/* Cartes du joueur */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Cartes du joueur
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            {[0, 1].map((index) => (
              <CardSlot
                key={`player-drawer-${index}`}
                card={selectedCards[index] || null}
                onClick={() => {
                  setSelectedSlot(index + 5);
                  setCardSelectorOpen(true);
                }}
                disabled={false}
              />
            ))}
          </Box>
        </Box>
      </>}

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
          onChange={(e) => {
            const newAction = e.target.value as PokerAction;
            setAction(newAction);
            if (newAction === 'check') {
              setPriceToCall(0);
            }
            if (newAction === 'fold') {
              setIsWin(false);
              setResult(-1);
            }
          }}          size={inDrawer ? "medium" : "small"}
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
  onClick={() => setSaveModalOpen(true)}
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
                      isCBet: false,
                      remainingPlayers: 9, // Ajouter cette ligne avec une valeur par défaut
                      communityCards: (() => {
                        switch (currentStreet) {
                          case 'flop':
                            return communityCards.slice(0, 3).filter((card): card is Card => card !== null);
                          case 'turn':
                            return communityCards.slice(0, 4).filter((card): card is Card => card !== null);
                          case 'river':
                            return communityCards.slice(0, 5).filter((card): card is Card => card !== null);
                          default:
                            return undefined;
                        }
                      })()
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
        height: { xs: '80%', sm: '70%', md: '80%' }, // Hauteur adaptable
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
          {communityCards.map((card, index) => {
            const isDisabled =
              (activeStep === 0) || // Preflop
              (activeStep === 1 && index > 2) || // Flop
              (activeStep === 2 && index > 3); // Turn

            const justUnlocked =
              (activeStep === 1 && index < 3) || // Flop
              (activeStep === 2 && index === 3) || // Turn
              (activeStep === 3 && index === 4); // River

            return (
              <CardSlot
                key={index}
                card={card}
                onClick={() => {
                  setSelectedSlot(index);
                  setCardSelectorOpen(true);
                }}
                disabled={isDisabled}
                justUnlocked={justUnlocked}
              />
            );
          })}
        </Box>


        <Box sx={{ display: 'flex', gap: 2 }}>
        <FormControl sx={{ width: '200px' }}>
          <Select
            value={action}
            onChange={(e) => {
              const newAction = e.target.value as PokerAction;
              setAction(newAction);
              if (newAction === 'check') {
                setPriceToCall(0);
              }
              if (newAction === 'fold') {
                setIsWin(false);
                setResult(-1);
              }
            }}            size="small"
          >
            {Object.entries(actionIcons).map(([key, icon]) => (
              <MenuItem key={key} value={key}>
                <ListItemIcon>{icon}</ListItemIcon>
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </MenuItem>
            ))}
          </Select>

        </FormControl>                    <TextField
          size="small"
          type="number"
          value={priceToCall}
          onChange={(e) => setPriceToCall(Number(e.target.value))}
          label="Prix pour suivre (BB)"
          sx={{ width: '175px' }}
        />
        </Box>

        {/* Ligne 5: Action */}


        {/* Ligne 6: Cartes du joueur */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          {[0, 1].map((index) => (
            <CardSlot
              key={`player-${index}`}
              card={selectedCards[index] || null}
              disabled={false}
              onClick={() => {
                setSelectedSlot(index + 5);
                setCardSelectorOpen(true);
              }}
            />
          ))}
        </Box>

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

      </Box>

      {/* Footer */}
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
        justifyContent: 'center', // Centré en mobile
        alignItems: 'center',
        gap: 2,

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

        {/* Groupe de droite */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          {/* <FormControlLabel
            control={
              <Checkbox
                checked={isWin}
                onChange={(e) => {
                  setIsWin(e.target.checked);
                  setResult(e.target.checked ? 1 : -1);
                }}
              />
            }
            label="Win"
          /> */}
<Button 
  variant="outlined" 
  onClick={() => setSaveModalOpen(true)}
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
                      isCBet: false,
                      remainingPlayers: 9, // Ajouter cette ligne avec une valeur par défaut
                      communityCards: (() => {
                        switch (currentStreet) {
                          case 'flop':
                            return communityCards.slice(0, 3).filter((card): card is Card => card !== null);
                          case 'turn':
                            return communityCards.slice(0, 4).filter((card): card is Card => card !== null);
                          case 'river':
                            return communityCards.slice(0, 5).filter((card): card is Card => card !== null);
                          default:
                            return undefined;
                        }
                      })()
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
      {canShowPredictions && showPredictionFab && (
  <Tooltip title="Voir les prédictions">
    <Fab
      color="secondary"
      sx={{
        position: 'fixed',
        top: 70,
        right: 20,
        zIndex: 1000
      }}
      onClick={() => setOpenPredictions(true)}
    >
      <PredictionIcon />
    </Fab>
  </Tooltip>
)}
<Snackbar 
  open={showPredictionSnack}
  anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
  sx={{
    margin: 'auto',
    maxWidth: { xs: '80%', sm: '100%' },
    '& .MuiSnackbarContent-root': {
      width: { xs: '250px', sm: 'auto' }
    }
  }}
  message="Predictions available !"
  onClose={() => {
    setShowPredictionSnack(false);
    setShowPredictionFab(true);
  }}
  action={
    <>
      <Button 
        color="secondary" 
        size="small" 
        onClick={() => setOpenPredictions(true)}
      >
        Open prediction
      </Button>
      <IconButton
        size="small"
        color="inherit"
        onClick={() => {
          setShowPredictionSnack(false);
          setShowPredictionFab(true);
        }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </>
  }
/>

<SaveConfirmationDialog
  open={saveModalOpen}
  mode='create'
  onClose={() => setSaveModalOpen(false)}
  onSave={() => {
    handleSaveRound();
    setSaveModalOpen(false);
  }}
  onSaveAndContinue={() => {
    handleSaveRound();
    setPosition(getNextPosition(position));
    setPot('');
    setAction('fold');
    setSelectedCards([]);
    setCommunityCards([null, null, null, null, null]);
    setActiveStep(0);
    setIsWin(false);
    setSaveModalOpen(false);
  }}
  roundData={{
    cards: selectedCards,
    position,
    action,
    pot,
    stackSize,
    blindLevel,
    isWin,
    streets: roundData.streets
  }}
  onUpdateData={(field: any, value: any) => {
    switch (field) {
      case 'position': setPosition(value); break;
      case 'stackSize': setStackSize(value); break;
      case 'blindLevel': setBlindLevel(value); break;
      case 'pot': setPot(value); break;
      case 'isWin': 
        setIsWin(value);
        setResult(value ? 1 : -1);
        break;
    }
  }}
/>
    </Box>


  );
};

export default HandTracker;