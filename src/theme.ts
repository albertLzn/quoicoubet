// theme.ts
import { createTheme } from '@mui/material/styles';

 const theme = createTheme({
  palette: {
    primary: {
      main: '#663399', 
    },
    secondary: {
      main: '#FF7C05',
    },
    success: {
      main: '#663399',
    },
    error: {
      main: '#FF7C05',
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