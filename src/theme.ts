// theme.ts
import { createTheme } from '@mui/material/styles';

 const theme = createTheme({
  palette: {
    primary: {
      main: '#663399', // Violet Wario
    },
    secondary: {
      main: '#FFD700', // Jaune or
    },
    success: {
      main: '#663399',
    },
    error: {
      main: '#FFD700',
    },
    text: {
      // primary: '#FFD700',
      // secondary: '#FFD700',
    },
    background: {
      default: '#fff',
      paper: '#fff',
    }
  },
});

export default theme;