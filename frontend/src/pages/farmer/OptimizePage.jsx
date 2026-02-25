import React, { useState } from 'react';
import { Container, Box, Typography, Button, TextField, MenuItem, Card, CardContent, Alert, CircularProgress, Chip, Divider, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { MyLocation, Agriculture, DirectionsCarFilled, TrendingUp, ScaleOutlined } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useUnit } from '../../contexts/UnitContext';
import api from '../../services/api';
import MandiCard from '../../components/ui/MandiCard';
import ProfitChart from '../../components/ui/ProfitChart';
import MapView from '../../components/Map/MapView';
import DemandRadar from '../../components/ui/DemandRadar';
import TransportPool from '../../components/ui/TransportPool';

const CROPS = ['wheat', 'rice', 'maize', 'onion', 'potato', 'tomato', 'cotton', 'soybean', 'mustard', 'groundnut', 'garlic', 'chilli', 'banana', 'orange', 'millet', 'ragi', 'grapes', 'bajra', 'brinjal', 'jute', 'coconut'];
const VEHICLES = [
    { value: 'bike', label: 'vehicles.bike' },
    { value: 'auto', label: 'vehicles.auto' },
    { value: 'miniTruck', label: 'vehicles.miniTruck' },
    { value: 'largeTruck', label: 'vehicles.largeTruck' },
    { value: 'tractor', label: 'vehicles.tractor' },
];

const OptimizePage = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const { unit, setUnit } = useUnit();
    const [form, setForm] = useState({
        cropType: '',
        quantity: '',
        vehicleType: '',
        farmerLat: null, farmerLng: null, locationName: '',
    });
    const [gpsLoading, setGpsLoading] = useState(false);
    const [gpsError, setGpsError] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState([]);
    const [error, setError] = useState('');
    const [showMap, setShowMap] = useState(false);

    const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const detectLocation = () => {
        setGpsLoading(true); setGpsError('');
        if (!navigator.geolocation) {
            setGpsError('Geolocation not supported by your browser.');
            setGpsLoading(false); return;
        }
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                let locationName = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
                // Try reverse geocode with nominatim
                try {
                    const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
                    const data = await resp.json();
                    locationName = data.address?.village || data.address?.town || data.address?.city || locationName;
                } catch { }
                setForm(f => ({ ...f, farmerLat: lat, farmerLng: lng, locationName }));
                setGpsLoading(false);
            },
            (err) => {
                setGpsError(t('farmer.locationError'));
                setGpsLoading(false);
            },
            { timeout: 10000 }
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.farmerLat || !form.farmerLng) return setError('Please detect your location first.');
        setLoading(true); setError(''); setResults([]);
        try {
            const { data } = await api.post('/farmer/optimize', {
                farmerLat: form.farmerLat, farmerLng: form.farmerLng,
                farmerLocationName: form.locationName,
                cropType: form.cropType, quantity: Number(form.quantity),
                vehicleType: form.vehicleType,
            });
            setResults(data.results);
            setShowMap(true);
            setTimeout(() => document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' }), 200);
        } catch (err) {
            setError(err.response?.data?.error || 'Optimization failed. Please try again.');
        } finally { setLoading(false); }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Welcome header */}
            <Box mb={4}>
                <Typography variant="h4" fontWeight={800} gutterBottom>
                    {t('farmer.title')}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    {user?.name ? t('farmer.subtitle') : t('farmer.subtitle')}
                </Typography>
            </Box>

            {/* Optimize Form */}
            <Card sx={{ mb: 4 }}>
                <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
                    <Typography variant="h6" fontWeight={700} mb={3} display="flex" alignItems="center" gap={1}>
                        <Agriculture color="primary" /> Find Best Mandi
                    </Typography>

                    <Box component="form" onSubmit={handleSubmit}>
                        <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }} gap={2.5} mb={3}>
                            <TextField
                                select label={t('farmer.cropType')} name="cropType"
                                value={form.cropType} onChange={handleChange} required fullWidth
                            >
                                {CROPS.map(c => <MenuItem key={c} value={c}>{t(`crops.${c}`)}</MenuItem>)}
                            </TextField>
                            <TextField
                                label={t('farmer.quantity')} name="quantity" type="number"
                                value={form.quantity} onChange={handleChange} required fullWidth
                                inputProps={{ min: 1, max: 10000, step: 0.5 }}
                                helperText="In quintals (1 quintal = 100 kg)"
                            />
                            <TextField
                                select label={t('farmer.vehicleType')} name="vehicleType"
                                value={form.vehicleType} onChange={handleChange} required fullWidth
                            >
                                {VEHICLES.map(v => <MenuItem key={v.value} value={v.value}>{t(v.label)}</MenuItem>)}
                            </TextField>
                        </Box>

                        {/* GPS Detection */}
                        <Box mb={3}>
                            <Button
                                variant="outlined" size="large" onClick={detectLocation}
                                disabled={gpsLoading} startIcon={gpsLoading ? <CircularProgress size={18} /> : <MyLocation />}
                                sx={{ mr: 2, mb: 1 }}
                            >
                                {gpsLoading ? 'Detecting...' : t('farmer.detectLocation')}
                            </Button>
                            {form.locationName && (
                                <Chip
                                    label={`📍 ${form.locationName}`}
                                    color="success" variant="outlined"
                                    sx={{ fontWeight: 600, verticalAlign: 'middle' }}
                                />
                            )}
                            {gpsError && <Alert severity="warning" sx={{ mt: 1 }}>{gpsError}</Alert>}
                        </Box>

                        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                        <Button
                            type="submit" variant="contained" size="large"
                            disabled={loading || !form.cropType || !form.quantity || !form.vehicleType || !form.farmerLat}
                            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <TrendingUp />}
                            sx={{ py: 1.5, px: 4, fontSize: '1rem' }}
                        >
                            {loading ? t('farmer.optimizing') : t('farmer.optimize')}
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            {/* Results Section */}
            {results.length > 0 && (
                <Box id="results-section">
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={1}>
                        <Typography variant="h5" fontWeight={700}>{t('farmer.results')}</Typography>
                        <Box display="flex" alignItems="center" gap={1.5}>
                            {/* Unit toggle */}
                            <ToggleButtonGroup
                                value={unit}
                                exclusive
                                onChange={(_, v) => v && setUnit(v)}
                                size="small"
                                sx={{ bgcolor: 'background.paper', borderRadius: 2 }}
                            >
                                <ToggleButton value="qtl" sx={{ fontWeight: 700, fontSize: '0.75rem', px: 1.5 }}>
                                    {t('unit.qtlShort')}
                                </ToggleButton>
                                <ToggleButton value="kg" sx={{ fontWeight: 700, fontSize: '0.75rem', px: 1.5 }}>
                                    {t('unit.kgShort')}
                                </ToggleButton>
                            </ToggleButtonGroup>
                            <Chip label={t('farmer.mandisFound', { count: results.length })} color="primary" variant="outlined" sx={{ fontWeight: 700 }} />
                        </Box>
                    </Box>

                    {/* Map */}
                    {showMap && form.farmerLat && (
                        <Card sx={{ mb: 3, overflow: 'hidden' }}>
                            <MapView
                                farmerLat={form.farmerLat} farmerLng={form.farmerLng}
                                mandis={results} bestMandi={results[0]}
                            />
                        </Card>
                    )}

                    {/* Profit Chart */}
                    <Card sx={{ mb: 3, p: 2 }}>
                        <ProfitChart results={results.slice(0, 6)} />
                    </Card>

                    {/* ── Intelligence Panels ──────────────────────────────── */}
                    <Box mb={1}>
                        <Typography variant="overline" fontWeight={700} color="text.secondary" letterSpacing={1.5}>
                            Smart Insights
                        </Typography>
                    </Box>

                    {/* Demand Radar */}
                    <DemandRadar results={results} cropType={form.cropType} />

                    {/* Transport Pool */}
                    <TransportPool
                        bestMandi={results[0]}
                        cropType={form.cropType}
                        vehicleType={form.vehicleType}
                        quantity={Number(form.quantity)}
                    />

                    {/* ── Mandi Cards ──────────────────────────────────────── */}
                    <Box mb={1}>
                        <Typography variant="overline" fontWeight={700} color="text.secondary" letterSpacing={1.5}>
                            All Mandis Ranked
                        </Typography>
                    </Box>

                    {/* Mandi Cards */}
                    {results.map((mandi, i) => (
                        <MandiCard key={mandi.mandiId || i} mandi={mandi} rank={mandi.rank} />
                    ))}
                </Box>
            )}
        </Container>
    );
};

export default OptimizePage;
