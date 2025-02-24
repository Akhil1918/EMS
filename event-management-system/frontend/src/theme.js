import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Customize primary color
    },
    secondary: {
      main: '#dc004e', // Customize secondary color
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
  components: {
    MuiTab: {
      styleOverrides: {
        root: {
          fontSize: '0.9rem',
          fontWeight: 500,
          '&.Mui-selected': {
            color: '#1976d2'
          }
        }
      }
    }
  },
});

export default theme;
