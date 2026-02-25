import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Button, Typography, Alert, CircularProgress, TextField, Stack } from '@mui/material';
import AuthLayout from '../../layouts/AuthLayout';
import { useAuth } from '../../contexts/AuthContext';

const OtpVerifyPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const { verifyOtp, resendOtp } = useAuth();
    const email = location.state?.email || '';
    const [otp, setOtp] = useState(Array(6).fill(''));
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [countdown, setCountdown] = useState(60);
    const inputRefs = useRef([]);

    useEffect(() => {
        if (countdown <= 0) return;
        const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [countdown]);

    const handleOtpChange = (i, val) => {
        if (!/^\d*$/.test(val)) return;
        const next = [...otp];
        next[i] = val.slice(-1);
        setOtp(next);
        if (val && i < 5) inputRefs.current[i + 1]?.focus();
    };

    const handleKeyDown = (i, e) => {
        if (e.key === 'Backspace' && !otp[i] && i > 0) inputRefs.current[i - 1]?.focus();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const code = otp.join('');
        if (code.length !== 6) return setError('Please enter all 6 digits');
        setLoading(true); setError('');
        try {
            const user = await verifyOtp(email, code);
            navigate(user.role === 'farmer' ? '/farmer' : '/mandi', { replace: true });
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid OTP');
        } finally { setLoading(false); }
    };

    const handleResend = async () => {
        setResending(true); setError(''); setSuccess('');
        try {
            await resendOtp(email);
            setSuccess('OTP resent successfully!');
            setCountdown(60);
            setOtp(Array(6).fill(''));
            inputRefs.current[0]?.focus();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to resend OTP');
        } finally { setResending(false); }
    };

    if (!email) return navigate('/auth/signup'), null;

    return (
        <AuthLayout title={t('auth.verifyEmail')} subtitle={`${t('auth.otpSent')} ${email}`}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
            <Box component="form" onSubmit={handleSubmit}>
                {/* OTP digit inputs */}
                <Stack direction="row" spacing={1} justifyContent="center" mb={3}>
                    {otp.map((digit, i) => (
                        <TextField
                            key={i} value={digit}
                            onChange={(e) => handleOtpChange(i, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(i, e)}
                            inputRef={el => inputRefs.current[i] = el}
                            inputProps={{ maxLength: 1, style: { textAlign: 'center', fontSize: '1.5rem', fontWeight: 700, padding: '12px 0', width: '40px' } }}
                            sx={{ width: 52 }} autoFocus={i === 0}
                        />
                    ))}
                </Stack>
                <Button type="submit" variant="contained" size="large" fullWidth disabled={loading} sx={{ py: 1.5, mb: 2 }}>
                    {loading ? <CircularProgress size={24} color="inherit" /> : t('auth.verify')}
                </Button>
                <Box textAlign="center">
                    <Button onClick={handleResend} disabled={resending || countdown > 0} variant="text" color="primary">
                        {resending ? <CircularProgress size={18} /> : countdown > 0 ? `${t('auth.resendOtp')} (${countdown}s)` : t('auth.resendOtp')}
                    </Button>
                </Box>
                <Box textAlign="center" mt={1}>
                    <Link to="/auth/login" style={{ color: '#555', fontSize: '0.875rem', textDecoration: 'none' }}>
                        {t('auth.backToLogin')}
                    </Link>
                </Box>
            </Box>
        </AuthLayout>
    );
};

export default OtpVerifyPage;
