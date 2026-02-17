import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import {
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Alert,
  Tabs,
  Tab,
  IconButton,
  Fade,
} from '@mui/material';
// Icons removed
import theme from './theme';
import Hero from './components/Hero';
import OptimizeForm from './components/OptimizeForm';
import ResultsSection from './components/ResultsSection';
import FarmerProfile from './components/FarmerProfile';
import Dashboard from './components/Dashboard';
import { mockMandis, farmerLocations } from './utils/mockData';
import { calculateOptimization } from './utils/calculations';
import { saveOptimization, getProfile } from './services/storage';

function App() {
  const [mandis, setMandis] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [profileOpen, setProfileOpen] = useState(false);
  const [farmerLocation, setFarmerLocation] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const savedProfile = getProfile();
    setProfile(savedProfile);
  }, [profileOpen]);

  const handleOptimize = async (formData) => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Get farmer location coordinates
      const location = farmerLocations.find(loc => loc.name === formData.farmerLocation);
      setFarmerLocation(location);

      // Calculate optimization using mock data
      const optimizedMandis = calculateOptimization(mockMandis, formData);
      setMandis(optimizedMandis);

      // Save to history
      saveOptimization({
        cropType: formData.cropType,
        quantity: formData.quantity,
        vehicleType: formData.vehicleType,
        farmerLocation: formData.farmerLocation,
        bestMandi: optimizedMandis[0],
        timestamp: new Date().toISOString(),
      });

      // Smooth scroll to results
      setTimeout(() => {
        const resultsSection = document.getElementById('results');
        if (resultsSection) {
          resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (err) {
      setError('Failed to optimize route. Please try again.');
      console.error('Optimization error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
    // Scroll to top when changing tabs
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        {/* Sticky AppBar */}
        <AppBar
          position="sticky"
          elevation={4}
          sx={{
            background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)',
          }}
        >
          <Toolbar>
            <span style={{ fontSize: 36, marginRight: 16 }}>🌾</span>
            <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
              Krishi-Route – Smart Agriculture Platform
            </Typography>
            <IconButton
              color="inherit"
              onClick={() => setProfileOpen(true)}
              sx={{
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.1)',
                  transform: 'scale(1.1)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              <span style={{ fontSize: 32 }}>👤</span>
            </IconButton>
          </Toolbar>

          {/* Navigation Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'rgba(255,255,255,0.2)' }}>
            <Tabs
              value={currentTab}
              onChange={handleTabChange}
              textColor="inherit"
              indicatorColor="secondary"
              sx={{
                '& .MuiTab-root': {
                  color: 'rgba(255,255,255,0.7)',
                  fontWeight: 600,
                  fontSize: '1rem',
                  '&.Mui-selected': {
                    color: 'white',
                  },
                },
              }}
            >
              <Tab label="Optimize" />
              <Tab label="Dashboard" />
            </Tabs>
          </Box>
        </AppBar>

        {/* Tab Content */}
        {currentTab === 0 && (
          <Fade in timeout={600}>
            <Box>
              {/* Hero Section */}
              <Hero />

              {/* Optimize Form */}
              <OptimizeForm onOptimize={handleOptimize} loading={loading} />

              {/* Error Alert */}
              {error && (
                <Container maxWidth="lg" sx={{ px: 3, mb: 4 }}>
                  <Alert severity="error" onClose={() => setError(null)}>
                    {error}
                  </Alert>
                </Container>
              )}

              {/* Welcome Message */}
              {profile && (
                <Container maxWidth="lg" sx={{ px: 3, mb: 2 }}>
                  <Fade in timeout={800}>
                    <Alert
                      severity="info"
                      sx={{
                        bgcolor: '#E3F2FD',
                        '& .MuiAlert-icon': {
                          fontSize: 28,
                        },
                      }}
                    >
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        Welcome back, {profile.name}! 👋
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {profile.village && `From ${profile.village} • `}
                        Ready to optimize your next route?
                      </Typography>
                    </Alert>
                  </Fade>
                </Container>
              )}

              {/* Results Section */}
              <div id="results">
                <ResultsSection mandis={mandis} farmerLocation={farmerLocation} />
              </div>
            </Box>
          </Fade>
        )}

        {currentTab === 1 && (
          <Fade in timeout={600}>
            <Box>
              <Dashboard />
            </Box>
          </Fade>
        )}

        {/* Footer */}
        <Box
          component="footer"
          sx={{
            background: 'linear-gradient(135deg, #1B5E20 0%, #0D3818 100%)',
            color: 'white',
            py: 6,
            mt: 10,
            textAlign: 'center',
          }}
        >
          <Container maxWidth="lg">
            <span style={{ fontSize: 48, marginBottom: 16 }}>🌾</span>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
              Krishi-Route
            </Typography>
            <Typography variant="body1" sx={{ color: '#C8E6C9', mb: 3 }}>
              Empowering farmers with smart logistics optimization
            </Typography>
            <Typography variant="body2" sx={{ color: '#A5D6A7', mb: 1 }}>
              🌾 Maximize Profit • 🚚 Optimize Routes • 📊 Track Performance
            </Typography>
            <Typography variant="caption" sx={{ color: '#81C784' }}>
              © 2026 Krishi-Route. All rights reserved.
            </Typography>
          </Container>
        </Box>

        {/* Farmer Profile Drawer */}
        <FarmerProfile
          open={profileOpen}
          onClose={() => setProfileOpen(false)}
        />
      </Box>
    </ThemeProvider>
  );
}

export default App;
