import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TextField, Button, Box, Typography, Alert, CircularProgress, Divider, ToggleButton, ToggleButtonGroup, InputAdornment, IconButton } from '@mui/material';
import { Agriculture, Store, Visibility, VisibilityOff } from '@mui/icons-material';
import AuthLayout from '../../layouts/AuthLayout';
import { useAuth } from '../../contexts/AuthContext';

const SignupPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { signup } = useAuth();
    const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'farmer' });
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password !== form.confirmPassword) return setError(t('auth.passwordMismatch'));
        if (form.password.length < 8) return setError(t('auth.passwordTooShort'));
        setLoading(true); setError('');
        try {
            await signup(form.name, form.email, form.password, form.role);
            navigate('/auth/verify-otp', { state: { email: form.email, role: form.role } });
        } catch (err) {
            setError(err.response?.data?.error || 'Signup failed');
        } finally { setLoading(false); }
    };

    return (
        <AuthLayout title={t('auth.createAccount')} subtitle={`Join Krishi-Route as a ${form.role}`}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={2.5}>
                {/* Role selection */}
                <Box>
                    <Typography variant="caption" color="text.secondary" mb={1} display="block" fontWeight={600}>
                        {t('auth.role')}
                    </Typography>
                    <ToggleButtonGroup
                        value={form.role} exclusive
                        onChange={(_, v) => v && setForm(f => ({ ...f, role: v }))}
                        fullWidth size="large"
                        sx={{
                            '& .MuiToggleButton-root': { py: 1.5, borderRadius: '10px !important', border: '2px solid #e0e0e0', fontWeight: 700 },
                            '& .Mui-selected': { bgcolor: '#E8F5E9 !important', color: '#2E7D32 !important', borderColor: '#2E7D32 !important' }
                        }}
                    >
                        <ToggleButton value="farmer"><Agriculture sx={{ mr: 1 }} />{t('auth.farmer')}</ToggleButton>
                        <ToggleButton value="mandi"><Store sx={{ mr: 1 }} />{t('auth.mandi')}</ToggleButton>
                    </ToggleButtonGroup>
                </Box>
                <TextField label={t('auth.name')} name="name" value={form.name} onChange={handleChange} required fullWidth autoFocus />
                <TextField label={t('auth.email')} name="email" type="email" value={form.email} onChange={handleChange} required fullWidth />
                <TextField label={t('auth.password')} name="password" type={showPass ? 'text' : 'password'}
                    value={form.password} onChange={handleChange} required fullWidth
                    helperText="Minimum 8 characters"
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
                <TextField label={t('auth.confirmPassword')} name="confirmPassword" type="password"
                    value={form.confirmPassword} onChange={handleChange} required fullWidth
                    error={form.confirmPassword.length > 0 && form.password !== form.confirmPassword}
                    helperText={form.confirmPassword.length > 0 && form.password !== form.confirmPassword ? t('auth.passwordMismatch') : ''}
                />
                <Button type="submit" variant="contained" size="large" fullWidth disabled={loading} sx={{ py: 1.5, fontSize: '1rem' }}>
                    {loading ? <CircularProgress size={24} color="inherit" /> : t('auth.createAccount')}
                </Button>
                <Divider />
                <Typography variant="body2" textAlign="center" color="text.secondary">
                    {t('auth.haveAccount')}{' '}
                    <Link to="/auth/login" style={{ color: '#2E7D32', fontWeight: 700, textDecoration: 'none' }}>
                        {t('auth.login')}
                    </Link>
                </Typography>
            </Box>
        </AuthLayout>
    );
};

export default SignupPage;
