import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Box } from '@mui/material';
import ArticlesList from './components/ArticlesList';
import ArticleForm from './components/ArticleForm';

const appTheme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#ECF4FC',
      paper: '#F8FCFF',
    },
    primary: {
      main: '#0081FA',
      dark: '#2F77BA',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#FA9B00',
      dark: '#A57B37',
      contrastText: '#161616',
    },
    info: {
      main: '#2F77BA',
      contrastText: '#FFFFFF',
    },
    warning: {
      main: '#A57B37',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#3D5D7A',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#504635',
      contrastText: '#FFFFFF',
    },
    text: {
      primary: '#3D5D7A',
      secondary: '#504635',
    },
    divider: 'rgba(61, 93, 122, 0.24)',
    action: {
      hover: 'rgba(0, 129, 250, 0.1)',
      selected: 'rgba(47, 119, 186, 0.14)',
    },
  },
  typography: {
    fontFamily: '"Open Sans", "Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*, *::before, *::after': {
          fontFamily: '"Open Sans", "Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 6px 18px rgba(61, 93, 122, 0.14)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundImage: 'none',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.88)',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <BrowserRouter>
        <Box sx={{ maxWidth: 1200, margin: '0 auto', p: 3 }}>
          <Routes>
            <Route path="/" element={<ArticlesList />} />
            <Route path="/new" element={<ArticleForm />} />
            <Route path="/edit/:id" element={<ArticleForm />} />
          </Routes>
        </Box>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
