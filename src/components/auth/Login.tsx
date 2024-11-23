import React from 'react';
import { Box, Button, Paper, Typography } from '@mui/material';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../config/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { setUser } from '../../features/auth/authSlice';
import GoogleIcon from '@mui/icons-material/Google';

const Login: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      const result = await signInWithPopup(auth, provider);
      
      const userData = {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
      };

      dispatch(setUser(userData));
      navigate('/');
    } catch (error) {
      console.error('Erreur de connexion:', error);
    }
  };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        backgroundColor: 'background.default'
      }}
    >
      <Paper 
        elevation={3}
        sx={{ 
          p: 4, 
          maxWidth: 400, 
          width: '100%',
          borderRadius: 2
        }}
      >
        <Typography 
          variant="h5" 
          gutterBottom 
          align="center"
          sx={{ mb: 3 }}
        >
          Connexion à Poker Tracker
        </Typography>
        <Button
          variant="contained"
          fullWidth
          onClick={handleLogin}
          startIcon={<GoogleIcon />}
          sx={{ 
            py: 1.5,
            textTransform: 'none',
            fontSize: '1.1rem'
          }}
        >
          Se connecter avec Google
        </Button>
      </Paper>
    </Box>
  );
};

export default Login;