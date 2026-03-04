import React from 'react';
import { Box, Container, Typography, Card, CardContent, IconButton, useTheme } from '@mui/material';
import { LightMode, DarkMode } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useThemeMode } from '../contexts/ThemeContext';
import LanguageSwitcher from '../components/ui/LanguageSwitcher';

const AuthLayout = ({ children, title, subtitle }) => {
    const { t } = useTranslation();
    const { mode, toggleTheme } = useThemeMode();
    const theme = useTheme();

    const isDark = mode === 'dark';

    return (
        <Box sx={{
            minHeight: '100vh',
            background: isDark
                ? 'linear-gradient(160deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)'
                : 'linear-gradient(160deg, #e8f5e9 0%, #f1f8e9 50%, #fff8e1 100%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 4,
            transition: 'background 0.3s ease',
        }}>
            {/* Action Bar top-right */}
            <Box sx={{ position: 'fixed', top: 16, right: 16, display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton onClick={toggleTheme} sx={{
                    bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'white',
                    color: isDark ? 'primary.light' : 'primary.main',
                    border: '1.5px solid',
                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(46,125,50,0.2)',
                    '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(46,125,50,0.05)' }
                }}>
                    {isDark ? <LightMode fontSize="small" /> : <DarkMode fontSize="small" />}
                </IconButton>
                <LanguageSwitcher theme={isDark ? 'dark' : 'light'} />
            </Box>

            <Container maxWidth="sm">
                {/* Logo */}
                <Box textAlign="center" mb={3}>
                    <Box sx={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: 72, height: 72, borderRadius: '50%',
                        background: isDark
                            ? 'linear-gradient(135deg, #16A34A, #22C55E)'
                            : 'linear-gradient(135deg, #2E7D32, #4CAF50)',
                        boxShadow: isDark
                            ? '0 8px 32px rgba(34,197,94,0.3)'
                            : '0 8px 24px rgba(46,125,50,0.3)',
                        mb: 2,
                    }}>
                        <span style={{ fontSize: 36 }}>🌾</span>
                    </Box>
                    <Typography variant="h4" fontWeight={800} color={isDark ? 'primary.light' : 'primary.dark'} gutterBottom>
                        {t('app.name')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">{t('app.tagline')}</Typography>
                </Box>

                <Card elevation={0} sx={{
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                    boxShadow: isDark ? '0 8px 48px rgba(0,0,0,0.5)' : '0 8px 32px rgba(0,0,0,0.1)'
                }}>
                    <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                        {title && (
                            <Box mb={3}>
                                <Typography variant="h5" fontWeight={700} gutterBottom>{title}</Typography>
                                {subtitle && <Typography variant="body2" color="text.secondary">{subtitle}</Typography>}
                            </Box>
                        )}
                        {children}
                    </CardContent>
                </Card>
            </Container>
        </Box>
    );
};

export default AuthLayout;
