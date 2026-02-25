import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TextField, Button, Box, Alert, CircularProgress } from '@mui/material';
import AuthLayout from '../../layouts/AuthLayout';
import { useAuth } from '../../contexts/AuthContext';

const ForgotPasswordPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { forgotPassword } = useAuth();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await forgotPassword(email);
            setMessage('If this email is registered, an OTP has been sent.');
            setTimeout(() => navigate('/auth/reset-password', { state: { email } }), 2000);
        } catch (err) {
            setMessage('If this email is registered, an OTP has been sent.');
        } finally { setLoading(false); }
    };

    return (
        <AuthLayout title={t('auth.forgotPassword')} subtitle="Enter your email to receive a password reset OTP">
            {message && <Alert severity="info" sx={{ mb: 2 }}>{message}</Alert>}
            <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={2.5}>
                <TextField label={t('auth.email')} type="email" value={email} onChange={e => setEmail(e.target.value)} required fullWidth autoFocus />
                <Button type="submit" variant="contained" size="large" fullWidth disabled={loading} sx={{ py: 1.5 }}>
                    {loading ? <CircularProgress size={24} color="inherit" /> : t('auth.sendOtp')}
                </Button>
                <Box textAlign="center">
                    <Link to="/auth/login" style={{ color: '#2E7D32', fontWeight: 600, textDecoration: 'none', fontSize: '0.875rem' }}>
                        {t('auth.backToLogin')}
                    </Link>
                </Box>
            </Box>
        </AuthLayout>
    );
};

export default ForgotPasswordPage;
