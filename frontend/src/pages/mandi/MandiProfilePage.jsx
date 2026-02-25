import React, { useState, useEffect } from 'react';
import {
    Container, Box, Typography, Card, CardContent,
    TextField, Button, Alert, CircularProgress, MenuItem,
    Tabs, Tab, Avatar, Chip, Divider, InputAdornment, IconButton
} from '@mui/material';
import { LocationOn, Save, Lock, Store, Visibility, VisibilityOff, ArrowBack } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../../services/api';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const STATES = [
    'Andhra Pradesh', 'Bihar', 'Delhi', 'Gujarat', 'Haryana', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha',
    'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal',
];

const LocationPicker = ({ position, onPick }) => {
    useMapEvents({ click(e) { onPick(e.latlng.lat, e.latlng.lng); } });
    return position ? <Marker position={position} /> : null;
};

const MandiProfilePage = () => {
    const { t } = useTranslation();
    const navLocation = useLocation();
    const navigate = useNavigate();
    const { user, updateUser, changePassword } = useAuth();
    const [tab, setTab] = useState(navLocation.state?.tab ?? 0);

    // Update tab if it changes in navigation state
    useEffect(() => {
        if (navLocation.state?.tab !== undefined) {
            setTab(navLocation.state.tab);
        }
    }, [navLocation.state]);

    // ── Profile form ─────────────────────────────────────────────
    const [form, setForm] = useState({
        mandiName: '', address: '', city: '', district: '',
        state: '', phone: '', licenseNumber: '', operatingHours: '', handlingRate: '',
    });
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });

    // ── Password form ─────────────────────────────────────────────
    const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '', confirm: '' });
    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [pwSaving, setPwSaving] = useState(false);
    const [pwMsg, setPwMsg] = useState({ type: '', text: '' });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await api.get('/mandi/admin/profile');

                // Prefer Mandi document data; fall back to user.mandiProfile
                const m = data.mandi;
                const up = data.profile?.mandiProfile;

                setForm({
                    mandiName: m?.name || up?.mandiName || '',
                    address: m?.location?.address || up?.location?.address || '',
                    city: m?.location?.city || up?.location?.city || '',
                    district: m?.location?.district || up?.location?.district || '',
                    state: m?.location?.state || up?.location?.state || '',
                    phone: m?.phone || up?.phone || '',
                    licenseNumber: m?.licenseNumber || '',
                    operatingHours: m?.operatingHours || '',
                    handlingRate: m?.handlingRate ?? '',
                });
                const lat = m?.location?.lat || up?.location?.lat;
                const lng = m?.location?.lng || up?.location?.lng;
                if (lat && lng) setLocation([lat, lng]);
            } catch (err) {
                console.error('Profile fetch error:', err.response?.data || err.message);
            } finally { setLoading(false); }
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    const handlePwChange = (e) => setPwForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleSave = async () => {
        setSaving(true); setProfileMsg({ type: '', text: '' });
        try {
            await api.put('/mandi/admin/profile', {
                name: form.mandiName,
                mandiData: {
                    mandiName: form.mandiName,
                    phone: form.phone,
                    licenseNumber: form.licenseNumber,
                    operatingHours: form.operatingHours,
                    handlingRate: Number(form.handlingRate) || 0,
                    // Only include location if we have coordinates
                    ...(location && {
                        location: {
                            lat: location[0], lng: location[1],
                            address: form.address, city: form.city,
                            district: form.district, state: form.state,
                        }
                    }),
                    // Without location, still update the address fields on the user profile
                    ...(!location && {
                        location: {
                            address: form.address, city: form.city,
                            district: form.district, state: form.state,
                        }
                    }),
                }
            });
            updateUser({ name: form.mandiName });
            setProfileMsg({ type: 'success', text: t('profile.profileSaved') });
        } catch (err) {
            setProfileMsg({ type: 'error', text: err.response?.data?.error || t('common.error') });
        } finally { setSaving(false); }
    };

    const handleChangePassword = async () => {
        if (pwForm.newPassword !== pwForm.confirm)
            return setPwMsg({ type: 'error', text: t('auth.passwordMismatch') });
        if (pwForm.newPassword.length < 6)
            return setPwMsg({ type: 'error', text: t('auth.passwordTooShort') });
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
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Navigation back */}
            <Button
                startIcon={<ArrowBack />}
                onClick={() => navigate('/mandi')}
                sx={{ mb: 2, fontWeight: 700, borderRadius: 2 }}
                color="inherit"
            >
                {t('common.backToDashboard')}
            </Button>
            {/* Page header */}
            <Box mb={4} display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontSize: '1.5rem', fontWeight: 800 }}>
                    {(user?.name || 'M')[0].toUpperCase()}
                </Avatar>
                <Box>
                    <Typography variant="h5" fontWeight={800}>{user?.name}</Typography>
                    <Typography variant="body2" color="text.secondary">{user?.email}</Typography>
                    <Chip label={t('auth.mandi')} size="small" color="primary" variant="outlined" sx={{ mt: 0.5, fontWeight: 700 }} />
                </Box>
            </Box>

            {/* Tabs */}
            <Box sx={{ borderBottom: '1px solid rgba(0,0,0,0.08)', mb: 3 }}>
                <Tabs value={tab} onChange={(_, v) => setTab(v)} textColor="primary" indicatorColor="primary">
                    <Tab icon={<Store sx={{ fontSize: 18 }} />} iconPosition="start" label={t('profile.accountInfo')} sx={{ fontWeight: 700, minHeight: 48 }} />
                    <Tab icon={<Lock sx={{ fontSize: 18 }} />} iconPosition="start" label={t('profile.security')} sx={{ fontWeight: 700, minHeight: 48 }} />
                </Tabs>
            </Box>

            {/* ── Tab 0: Mandi Info ─────────────────────────────────────── */}
            {tab === 0 && (
                <>
                    {profileMsg.text && (
                        <Alert severity={profileMsg.type} sx={{ mb: 2 }}
                            onClose={() => setProfileMsg({ type: '', text: '' })}>
                            {profileMsg.text}
                        </Alert>
                    )}
                    <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={3}>
                        {/* Info form */}
                        <Card elevation={0} sx={{ border: '1px solid rgba(0,0,0,0.08)' }}>
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="h6" fontWeight={700} mb={2.5}>
                                    {t('profile.accountInfo')}
                                </Typography>
                                <Box display="flex" flexDirection="column" gap={2.5}>
                                    <TextField label={t('mandi.mandiName')} name="mandiName" value={form.mandiName}
                                        onChange={handleChange} required fullWidth />
                                    <TextField label={t('auth.email')} value={user?.email}
                                        fullWidth disabled helperText={t('profile.emailHint')} />
                                    <TextField label="Address / Street" name="address" value={form.address}
                                        onChange={handleChange} fullWidth />
                                    <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                                        <TextField label="City" name="city" value={form.city} onChange={handleChange} fullWidth />
                                        <TextField label="District" name="district" value={form.district} onChange={handleChange} fullWidth />
                                    </Box>
                                    <TextField select label="State" name="state" value={form.state} onChange={handleChange} fullWidth>
                                        {STATES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                                    </TextField>
                                    <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                                        <TextField label="Phone" name="phone" value={form.phone}
                                            onChange={handleChange} fullWidth inputProps={{ maxLength: 10 }} />
                                        <TextField label={t('mandi.handlingRate')} name="handlingRate"
                                            type="number" value={form.handlingRate} onChange={handleChange}
                                            fullWidth helperText="₹ per quintal"
                                            InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} />
                                    </Box>
                                    <TextField label="License Number" name="licenseNumber"
                                        value={form.licenseNumber} onChange={handleChange} fullWidth />
                                    <TextField label="Operating Hours" name="operatingHours"
                                        value={form.operatingHours} onChange={handleChange}
                                        fullWidth placeholder="e.g. 6:00 AM – 2:00 PM"
                                        helperText="When is your mandi open for trade?" />
                                </Box>
                            </CardContent>
                        </Card>

                        {/* Map picker */}
                        <Card elevation={0} sx={{ border: '1px solid rgba(0,0,0,0.08)' }}>
                            <CardContent sx={{ p: 0, height: '100%', minHeight: 440 }}>
                                <Box sx={{ bgcolor: location ? '#E8F5E9' : '#FFF8E1', px: 2, py: 1.5 }}>
                                    <Typography variant="body2" fontWeight={600} color={location ? 'success.main' : 'text.secondary'}>
                                        {location
                                            ? `📍 Location set: ${location[0].toFixed(4)}, ${location[1].toFixed(4)} (click to update)`
                                            : `🗺️ ${t('mandi.pinLocation')} (optional)`}
                                    </Typography>
                                </Box>
                                <Box sx={{ height: 400 }}>
                                    <MapContainer
                                        center={location || [20.5937, 78.9629]}
                                        zoom={location ? 12 : 5}
                                        style={{ height: '100%', width: '100%' }}
                                    >
                                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                        <LocationPicker position={location} onPick={(lat, lng) => setLocation([lat, lng])} />
                                    </MapContainer>
                                </Box>
                            </CardContent>
                        </Card>
                    </Box>

                    <Box mt={3}>
                        <Button variant="contained" size="large" onClick={handleSave} disabled={saving}
                            startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <Save />}
                            sx={{ py: 1.5, px: 4, fontSize: '1rem' }}>
                            {t('profile.saveChanges')}
                        </Button>
                    </Box>
                </>
            )}

            {/* ── Tab 1: Security ───────────────────────────────────────── */}
            {tab === 1 && (
                <Card elevation={0} sx={{ border: '1px solid rgba(0,0,0,0.08)', maxWidth: 480 }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="body2" color="text.secondary" mb={3}>
                            Change your password. You must know your current password to proceed.
                            If you've forgotten it, use <strong>Forgot Password</strong> from the login page.
                        </Typography>
                        {pwMsg.text && (
                            <Alert severity={pwMsg.type} sx={{ mb: 2 }}
                                onClose={() => setPwMsg({ type: '', text: '' })}>
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
                                value={pwForm.newPassword} onChange={handlePwChange}
                                fullWidth helperText="Minimum 6 characters"
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
                                type="password" value={pwForm.confirm} onChange={handlePwChange} fullWidth
                                error={pwForm.confirm.length > 0 && pwForm.newPassword !== pwForm.confirm}
                                helperText={pwForm.confirm.length > 0 && pwForm.newPassword !== pwForm.confirm
                                    ? t('auth.passwordMismatch') : ''}
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

export default MandiProfilePage;
