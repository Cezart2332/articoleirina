import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Box, Button, Container, Typography } from '@mui/material';
import { FiBookOpen, FiPlus } from 'react-icons/fi';
import { useEffect } from 'react';
import ArticlesList from './components/ArticlesList';
import ArticleForm from './components/ArticleForm';

const appTheme = createTheme({
  palette: {
    mode: 'light',
    background: { default: '#F4F6FA', paper: '#FFFFFF' },
    primary: { main: '#3155D9', dark: '#213B9D', contrastText: '#FFFFFF' },
    secondary: { main: '#F06449', dark: '#BE3F29', contrastText: '#FFFFFF' },
    info: { main: '#3155D9', contrastText: '#FFFFFF' },
    warning: { main: '#B56A16', contrastText: '#FFFFFF' },
    success: { main: '#1B7F5C', contrastText: '#FFFFFF' },
    error: { main: '#C33C54', contrastText: '#FFFFFF' },
    text: { primary: '#17213A', secondary: '#68738A' },
    divider: '#E2E7F0',
    action: { hover: 'rgba(49, 85, 217, 0.08)', selected: 'rgba(49, 85, 217, 0.12)' },
  },
  typography: {
    fontFamily: '"Manrope", "Segoe UI", sans-serif',
    h1: { fontWeight: 800, letterSpacing: '-0.04em' },
    h2: { fontWeight: 800, letterSpacing: '-0.035em' },
    h3: { fontWeight: 750, letterSpacing: '-0.025em' },
    button: { fontWeight: 700 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*, *::before, *::after': { fontFamily: '"Manrope", "Segoe UI", sans-serif' },
      },
    },
    MuiButton: {
      styleOverrides: { root: { borderRadius: 10, textTransform: 'none', fontWeight: 700 } },
    },
    MuiCard: {
      styleOverrides: { root: { borderRadius: 16, boxShadow: '0 8px 28px rgba(23, 33, 58, 0.07)' } },
    },
    MuiPaper: {
      styleOverrides: { root: { borderRadius: 16, backgroundImage: 'none' } },
    },
    MuiOutlinedInput: {
      styleOverrides: { root: { backgroundColor: '#FFFFFF', borderRadius: 10 } },
    },
  },
});

function AppShell() {
  const location = useLocation();
  const isList = location.pathname === '/';

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [location.pathname]);

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Box component="header" sx={{ bgcolor: '#11182B', color: 'white', position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', inset: '0 0 0 auto', width: { xs: 90, md: 260 }, bgcolor: 'secondary.main', clipPath: 'polygon(58% 0, 100% 0, 100% 100%, 0 100%)' }} />
        <Container maxWidth="lg" sx={{ position: 'relative', height: { xs: 72, md: 82 }, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box component={Link} to="/" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'inherit', textDecoration: 'none' }}>
            <Box sx={{ width: 38, height: 38, borderRadius: 2.5, bgcolor: 'primary.main', display: 'grid', placeItems: 'center' }}>
              <FiBookOpen size={20} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.02em' }}>Irina Editorial</Typography>
              <Typography sx={{ color: 'rgba(255,255,255,.58)', fontSize: 12, mt: .35 }}>Content studio</Typography>
            </Box>
          </Box>
          {isList && (
            <Button component={Link} to="/new" variant="contained" color="secondary" startIcon={<FiPlus />} sx={{ display: { xs: 'none', sm: 'inline-flex' }, boxShadow: 'none' }}>
              Articol nou
            </Button>
          )}
        </Container>
      </Box>

      <Container component="main" maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
        <Routes>
          <Route path="/" element={<ArticlesList />} />
          <Route path="/new" element={<ArticleForm />} />
          <Route path="/edit/:id" element={<ArticleForm />} />
        </Routes>
      </Container>
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
