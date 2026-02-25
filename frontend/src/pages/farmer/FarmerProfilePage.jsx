import React, { useState, useEffect } from 'react';
import {
    Container, Box, Typography, Card, CardContent,
    TextField, MenuItem, Button, Alert, CircularProgress,
    Avatar, Chip, Divider, Tab, Tabs, InputAdornment, IconButton
} from '@mui/material';
import { Save, Lock, Person, Visibility, VisibilityOff, ArrowBack } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const STATES = [
    'Andhra Pradesh', 'Bihar', 'Delhi', 'Gujarat', 'Haryana', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha',
    'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal'
];
const VEHICLES = ['bike', 'auto', 'miniTruck', 'largeTruck', 'tractor'];

const FarmerProfilePage = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const { user, updateUser, changePassword } = useAuth();
    const [tab, setTab] = useState(location.state?.tab ?? 0);

    // Update tab if it changes in navigation state
    useEffect(() => {
        if (location.state?.tab !== undefined) {
            setTab(location.state.tab);
        }
    }, [location.state]);

    // Profile info state
    const [form, setForm] = useState({
        name: user?.name || '', village: '', district: '',
        state: '', phone: '', farmSize: '', preferredVehicle: '',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });

    // Password state
    const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '', confirm: '' });
    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [pwSaving, setPwSaving] = useState(false);
    const [pwMsg, setPwMsg] = useState({ type: '', text: '' });

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const { data } = await api.get('/farmer/profile');
                const fp = data.profile.farmerProfile || {};
                setForm({
                    name: data.profile.name || '',
                    village: fp.village || '', district: fp.district || '',
                    state: fp.state || '', phone: fp.phone || '',
                    farmSize: fp.farmSize || '', preferredVehicle: fp.preferredVehicle || '',
                });
            } catch { } finally { setLoading(false); }
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    const handlePwChange = (e) => setPwForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleSaveProfile = async () => {
        setSaving(true); setProfileMsg({ type: '', text: '' });
        try {
            const { data } = await api.put('/farmer/profile', {
                name: form.name,
                farmerProfile: {
                    village: form.village, district: form.district, state: form.state,
                    phone: form.phone, farmSize: Number(form.farmSize), preferredVehicle: form.preferredVehicle,
                }
            });
            updateUser({ name: data.profile.name });
            setProfileMsg({ type: 'success', text: t('profile.profileSaved') });
        } catch {
            setProfileMsg({ type: 'error', text: t('common.error') });
        } finally { setSaving(false); }
    };

    const handleChangePassword = async () => {
        if (pwForm.newPassword !== pwForm.confirm) {
            return setPwMsg({ type: 'error', text: t('auth.passwordMismatch') });
        }
        if (pwForm.newPassword.length < 6) {
            return setPwMsg({ type: 'error', text: t('auth.passwordTooShort') });
        }
        setPwSaving(true); setPwMsg({ type: '', text: '' });
        try {
            await changePassword(pwForm.oldPassword, pwForm.newPassword);
            setPwMsg({ type: 'success', text: t('profile.passwordChanged') });
            setPwForm({ oldPassword: '', newPassword: '', confirm: '' });
        } catch (err) {
            setPwMsg({ type: 'error', text: err.response?.data?.error || t('common.error') });
        } finally { setPwSaving(false); }
    };

    if (loading) return <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>;

    return (
        <Container maxWidth="sm" sx={{ py: 4 }}>
            {/* Navigation back */}
            <Button
                startIcon={<ArrowBack />}
                onClick={() => navigate('/')}
                sx={{ mb: 2, fontWeight: 700, borderRadius: 2 }}
                color="inherit"
            >
                {t('common.backToDashboard')}
            </Button>
            {/* Header */}
            <Box textAlign="center" mb={4}>
                <Avatar sx={{
                    width: 72, height: 72, bgcolor: 'primary.main',
                    mx: 'auto', mb: 2, fontSize: '1.75rem', fontWeight: 800,
                }}>
                    {(user?.name || 'F')[0].toUpperCase()}
                </Avatar>
                <Typography variant="h5" fontWeight={800}>{user?.name}</Typography>
                <Typography variant="body2" color="text.secondary" mb={1}>{user?.email}</Typography>
                <Chip label={t('auth.farmer')} size="small" color="success" variant="outlined" sx={{ fontWeight: 700 }} />
            </Box>

            {/* Tabs */}
            <Box sx={{ borderBottom: '1px solid rgba(0,0,0,0.08)', mb: 3 }}>
                <Tabs value={tab} onChange={(_, v) => setTab(v)} textColor="primary" indicatorColor="primary">
                    <Tab icon={<Person sx={{ fontSize: 18 }} />} iconPosition="start" label={t('profile.accountInfo')} sx={{ fontWeight: 700, minHeight: 48 }} />
                    <Tab icon={<Lock sx={{ fontSize: 18 }} />} iconPosition="start" label={t('profile.security')} sx={{ fontWeight: 700, minHeight: 48 }} />
                </Tabs>
            </Box>

            {/* Tab 0: Account Info */}
            {tab === 0 && (
                <Card elevation={0} sx={{ border: '1px solid rgba(0,0,0,0.08)' }}>
                    <CardContent sx={{ p: 3 }}>
                        {profileMsg.text && (
                            <Alert severity={profileMsg.type} sx={{ mb: 2 }} onClose={() => setProfileMsg({ type: '', text: '' })}>
                                {profileMsg.text}
                            </Alert>
                        )}
                        <Box display="flex" flexDirection="column" gap={2.5}>
                            <TextField label={t('auth.name')} name="name" value={form.name} onChange={handleChange} fullWidth />
                            <TextField label={t('auth.email')} value={user?.email} fullWidth disabled
                                helperText="Email cannot be changed" />
                            <TextField label="Village / Town" name="village" value={form.village} onChange={handleChange} fullWidth />
                            <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                                <TextField label="District" name="district" value={form.district} onChange={handleChange} fullWidth />
                                <TextField select label="State" name="state" value={form.state} onChange={handleChange} fullWidth>
                                    {STATES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                                </TextField>
                            </Box>
                            <TextField label="Phone" name="phone" value={form.phone} onChange={handleChange} fullWidth
                                inputProps={{ maxLength: 10 }} />
                            <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                                <TextField label="Farm Size (Acres)" name="farmSize" type="number"
                                    value={form.farmSize} onChange={handleChange} fullWidth />
                                <TextField select label="Preferred Vehicle" name="preferredVehicle"
                                    value={form.preferredVehicle} onChange={handleChange} fullWidth>
                                    {VEHICLES.map(v => <MenuItem key={v} value={v}>{t(`vehicles.${v}`)}</MenuItem>)}
                                </TextField>
                            </Box>
                            <Button variant="contained" size="large" onClick={handleSaveProfile} disabled={saving}
                                startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <Save />}
                                sx={{ py: 1.4 }}>
                                {t('profile.saveChanges')}
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            )}

            {/* Tab 1: Change Password */}
            {tab === 1 && (
                <Card elevation={0} sx={{ border: '1px solid rgba(0,0,0,0.08)' }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="body2" color="text.secondary" mb={3}>
                            Change your password. You must know your current password to proceed.
                            If you've forgotten it, use <strong>Forgot Password</strong> from the login page.
                        </Typography>
                        {pwMsg.text && (
                            <Alert severity={pwMsg.type} sx={{ mb: 2 }} onClose={() => setPwMsg({ type: '', text: '' })}>
                                {pwMsg.text}
                            </Alert>
                        )}
                        <Box display="flex" flexDirection="column" gap={2.5}>
                            <TextField
                                label={t('profile.oldPassword')} name="oldPassword"
                                type={showOld ? 'text' : 'password'}
                                value={pwForm.oldPassword} onChange={handlePwChange} fullWidth
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setShowOld(s => !s)} edge="end" size="small">
                                                {showOld ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            />
                            <TextField
                                label={t('profile.newPassword')} name="newPassword"
                                type={showNew ? 'text' : 'password'}
                                value={pwForm.newPassword} onChange={handlePwChange} fullWidth
                                helperText="Minimum 6 characters"
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setShowNew(s => !s)} edge="end" size="small">
                                                {showNew ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            />
                            <TextField
                                label={t('profile.confirmNew')} name="confirm"
                                type="password"
                                value={pwForm.confirm} onChange={handlePwChange} fullWidth
                                error={pwForm.confirm.length > 0 && pwForm.newPassword !== pwForm.confirm}
                                helperText={pwForm.confirm.length > 0 && pwForm.newPassword !== pwForm.confirm ? t('auth.passwordMismatch') : ''}
                            />
                            <Button variant="contained" size="large" onClick={handleChangePassword}
                                disabled={pwSaving || !pwForm.oldPassword || !pwForm.newPassword}
                                startIcon={pwSaving ? <CircularProgress size={18} color="inherit" /> : <Lock />}
                                sx={{ py: 1.4 }}>
                                {t('profile.updatePassword')}
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            )}
        </Container>
    );
};

export default FarmerProfilePage;
