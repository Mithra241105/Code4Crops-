import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TextField, Button, Box, Typography, Alert, InputAdornment, IconButton, CircularProgress, Divider } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import AuthLayout from '../../layouts/AuthLayout';
import { useAuth } from '../../contexts/AuthContext';

const LoginPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { login } = useAuth();
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            const user = await login(form.email, form.password);
            navigate(user.role === 'farmer' ? '/farmer' : '/mandi', { replace: true });
        } catch (err) {
            let msg = 'Login failed';
            if (!err.response) {
                msg = 'Server unreachable. Please check your backend connection.';
            } else {
                msg = err.response.data?.error || 'Login failed';
            }
            if (err.response?.data?.needsVerification) {
                navigate('/auth/verify-otp', { state: { email: form.email } });
                return;
            }
            setError(msg);
        } finally { setLoading(false); }
    };

    return (
        <AuthLayout title={t('auth.welcomeBack')} subtitle="Sign in to your Krishi-Route account">
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={2.5}>
                <TextField
                    label={t('auth.email')} name="email" type="email"
                    value={form.email} onChange={handleChange} required fullWidth
                    autoComplete="email" autoFocus
                />
                <TextField
                    label={t('auth.password')} name="password" type={showPass ? 'text' : 'password'}
                    value={form.password} onChange={handleChange} required fullWidth
                    autoComplete="current-password"
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton onClick={() => setShowPass(s => !s)} edge="end">
                                    {showPass ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        )
                    }}
                />
                <Box textAlign="right">
                    <Link to="/auth/forgot-password" style={{ color: '#2E7D32', fontSize: '0.875rem', textDecoration: 'none', fontWeight: 600 }}>
                        {t('auth.forgotPassword')}
                    </Link>
                </Box>
                <Button type="submit" variant="contained" size="large" fullWidth disabled={loading}
                    sx={{ py: 1.5, fontSize: '1rem' }}>
                    {loading ? <CircularProgress size={24} color="inherit" /> : t('auth.login')}
                </Button>
                <Divider />
                <Typography variant="body2" textAlign="center" color="text.secondary">
                    {t('auth.noAccount')}{' '}
                    <Link to="/auth/signup" style={{ color: '#2E7D32', fontWeight: 700, textDecoration: 'none' }}>
                        {t('auth.createAccount')}
                    </Link>
                </Typography>
            </Box>
        </AuthLayout>
    );
};

export default LoginPage;
