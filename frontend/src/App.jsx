import React, { useEffect, useMemo } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { I18nextProvider, useTranslation } from 'react-i18next';
import i18n from './i18n';
import { ThemeContextProvider, useThemeMode } from './contexts/ThemeContext';
import { lightTheme, darkTheme } from './theme';
import { AuthProvider } from './contexts/AuthContext';
import AppRouter from './router/AppRouter';

function AppContent() {
  const { i18n } = useTranslation();
  const { mode } = useThemeMode();
  const isRtl = i18n.language === 'ur';

  useEffect(() => {
    document.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language, isRtl]);

  const theme = useMemo(() => {
    const base = mode === 'dark' ? darkTheme : lightTheme;
    return createTheme({
      ...base,
      direction: isRtl ? 'rtl' : 'ltr',
    });
  }, [isRtl, mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </ThemeProvider>
  );
}

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <ThemeContextProvider>
        <AppContent />
      </ThemeContextProvider>
    </I18nextProvider>
  );
}

export default App;
