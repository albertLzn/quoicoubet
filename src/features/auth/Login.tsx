import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { 
  Button, 
  Card, 
  CardContent, 
  Typography, 
  Box 
} from '@mui/material';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { setUser, setError } from '../../features/auth/authSlice';
import GoogleIcon from '@mui/icons-material/Google';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      dispatch(setUser({
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
      }));
      navigate('/');
    } catch (error: any) {
      dispatch(setError(error.message));
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '80vh',
      }}
    >
      <Card sx={{ maxWidth: 400, width: '100%' }}>
        <CardContent>
          <Typography variant="h5" align="center" gutterBottom>
            Poker Tracker Login
          </Typography>
          <Button
            variant="contained"
            fullWidth
            startIcon={<GoogleIcon />}
            onClick={handleGoogleLogin}
            sx={{ mt: 2 }}
          >
            Se connecter avec Google
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;