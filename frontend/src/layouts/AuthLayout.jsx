import React from 'react';
import { Box, Container, Card, CardContent, Typography, IconButton } from '@mui/material';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/ui/LanguageSwitcher';

const AuthLayout = ({ children, title, subtitle }) => {
    const { t } = useTranslation();
    return (
        <Box sx={{
            minHeight: '100vh',
            background: 'linear-gradient(160deg, #e8f5e9 0%, #f1f8e9 50%, #fff8e1 100%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 4,
        }}>
            {/* Language switcher top-right */}
            <Box sx={{ position: 'fixed', top: 16, right: 16 }}>
                <LanguageSwitcher theme="light" />
            </Box>

            <Container maxWidth="sm">
                {/* Logo */}
                <Box textAlign="center" mb={3}>
                    <Box sx={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: 72, height: 72, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #2E7D32, #4CAF50)',
                        boxShadow: '0 8px 24px rgba(46,125,50,0.3)', mb: 2,
                    }}>
                        <span style={{ fontSize: 36 }}>🌾</span>
                    </Box>
                    <Typography variant="h4" fontWeight={800} color="primary.dark" gutterBottom>
                        {t('app.name')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">{t('app.tagline')}</Typography>
                </Box>

                <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
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
