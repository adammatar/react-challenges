import { createTheme, PaletteMode } from '@mui/material';

// Extend the theme palette to include custom background options
declare module '@mui/material/styles' {
  interface Palette {
    customBackground: {
      gradient: string;
      paper: string;
      default: string;
      gradientLight: string;
      gradientDark: string;
    };
  }
  interface PaletteOptions {
    customBackground?: {
      gradient?: string;
      paper?: string;
      default?: string;
      gradientLight?: string;
      gradientDark?: string;
    };
  }
}

export const createAppTheme = (mode: PaletteMode) => createTheme({
  palette: {
    mode,
    primary: {
      main: mode === 'dark' ? '#2196F3' : '#1976d2',
      light: mode === 'dark' ? '#64b5f6' : '#42a5f5',
      dark: mode === 'dark' ? '#1976d2' : '#1565c0',
      contrastText: '#fff',
    },
    secondary: {
      main: mode === 'dark' ? '#3f51b5' : '#9c27b0',
      light: mode === 'dark' ? '#7986cb' : '#ba68c8',
      dark: mode === 'dark' ? '#303f9f' : '#7b1fa2',
      contrastText: '#fff',
    },
    background: {
      default: mode === 'dark' ? '#0a1929' : '#f5f5f5',
      paper: mode === 'dark' ? '#0d2339' : '#ffffff',
    },
    customBackground: {
      gradient: mode === 'dark'
        ? 'linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(63, 81, 181, 0.1) 100%)'
        : 'linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(156, 39, 176, 0.05) 100%)',
      gradientLight: 'linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(156, 39, 176, 0.05) 100%)',
      gradientDark: 'linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(63, 81, 181, 0.1) 100%)',
      paper: mode === 'dark' ? '#0d2339' : '#ffffff',
      default: mode === 'dark' ? '#0a1929' : '#f5f5f5',
    },
    text: {
      primary: mode === 'dark' ? '#fff' : '#2c3e50',
      secondary: mode === 'dark' ? '#b0bec5' : '#546e7a',
    },
    divider: mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
      background: mode === 'dark'
        ? 'linear-gradient(45deg, #2196F3, #3f51b5)'
        : 'linear-gradient(45deg, #1976d2, #9c27b0)',
      backgroundClip: 'text',
      textFillColor: 'transparent',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.57,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '8px',
          fontWeight: 600,
        },
        containedPrimary: {
          background: mode === 'dark'
            ? 'linear-gradient(135deg, #2196F3 0%, #1976d2 100%)'
            : 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
          '&:hover': {
            background: mode === 'dark'
              ? 'linear-gradient(135deg, #1976d2 0%, #2196F3 100%)'
              : 'linear-gradient(135deg, #1565c0 0%, #1976d2 100%)',
          },
        },
        containedSecondary: {
          background: mode === 'dark'
            ? 'linear-gradient(135deg, #3f51b5 0%, #303f9f 100%)'
            : 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)',
          '&:hover': {
            background: mode === 'dark'
              ? 'linear-gradient(135deg, #303f9f 0%, #3f51b5 100%)'
              : 'linear-gradient(135deg, #7b1fa2 0%, #9c27b0 100%)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          backgroundImage: 'none',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: '12px',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: '12px',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: mode === 'dark'
            ? 'linear-gradient(135deg, #0a1929 0%, #0d2339 100%)'
            : 'none',
          backgroundColor: mode === 'light' ? '#ffffff' : 'transparent',
          borderBottom: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`,
        },
      },
    },
  },
});

// Export a default theme instance with light mode
export const theme = createAppTheme('light');

// Also export the createAppTheme function as default for ThemeContext
export default createAppTheme; 