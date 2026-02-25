import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TextField, Button, Box, Alert, CircularProgress } from '@mui/material';
import AuthLayout from '../../layouts/AuthLayout';
import { useAuth } from '../../contexts/AuthContext';

const ResetPasswordPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const { resetPassword } = useAuth();
    const [form, setForm] = useState({ email: location.state?.email || '', otp: '', newPassword: '', confirm: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.newPassword !== form.confirm) return setError(t('auth.passwordMismatch'));
        if (form.newPassword.length < 8) return setError(t('auth.passwordTooShort'));
        setLoading(true); setError('');
        try {
            await resetPassword(form.email, form.otp, form.newPassword);
            navigate('/auth/login', { state: { message: 'Password reset successfully. Please login.' } });
        } catch (err) {
            setError(err.response?.data?.error || 'Reset failed');
        } finally { setLoading(false); }
    };

    return (
        <AuthLayout title={t('auth.resetPassword')} subtitle="Enter the OTP and your new password">
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={2.5}>
                <TextField label={t('auth.email')} name="email" type="email" value={form.email} onChange={handleChange} required fullWidth />
                <TextField label={t('auth.enterOtp')} name="otp" value={form.otp} onChange={handleChange} required fullWidth inputProps={{ maxLength: 6 }} />
                <TextField label={t('auth.newPassword')} name="newPassword" type="password" value={form.newPassword} onChange={handleChange} required fullWidth />
                <TextField label={t('auth.confirmPassword')} name="confirm" type="password" value={form.confirm} onChange={handleChange} required fullWidth />
                <Button type="submit" variant="contained" size="large" fullWidth disabled={loading} sx={{ py: 1.5 }}>
                    {loading ? <CircularProgress size={24} color="inherit" /> : t('auth.resetPassword')}
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

export default ResetPasswordPage;
