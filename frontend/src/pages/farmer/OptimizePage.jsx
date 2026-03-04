import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Box, Typography, Button, TextField, MenuItem, Card, CardContent, Alert, CircularProgress, Chip, Divider, ToggleButtonGroup, ToggleButton, Snackbar } from '@mui/material';
import { MyLocation, Agriculture, DirectionsCarFilled, TrendingUp, ScaleOutlined, Map as MapIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useUnit } from '../../contexts/UnitContext';
import LocationPickerMap from '../../components/Map/LocationPickerMap';
import api from '../../services/api';
import MandiCard from '../../components/ui/MandiCard';
import ProfitChart from '../../components/ui/ProfitChart';
import MapView from '../../components/Map/MapView';
import DemandRadar from '../../components/ui/DemandRadar';

const CROPS = ['wheat', 'rice', 'maize', 'onion', 'potato', 'tomato', 'cotton', 'soybean', 'mustard', 'groundnut', 'garlic', 'chilli', 'banana', 'orange', 'millet', 'ragi', 'grapes', 'bajra', 'brinjal', 'jute', 'coconut'];
const VEHICLES = [
    { value: 'bike', label: 'vehicles.bike' },
    { value: 'auto', label: 'vehicles.auto' },
    { value: 'miniTruck', label: 'vehicles.miniTruck' },
    { value: 'largeTruck', label: 'vehicles.largeTruck' },
    { value: 'tractor', label: 'vehicles.tractor' },
];

const OptimizePage = () => {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const { user } = useAuth();
    const { unit, setUnit } = useUnit();
    const [form, setForm] = useState({
        cropType: '',
        quantity: '',
        vehicleType: '',
        travelDate: new Date().toISOString().split('T')[0], // Default to today
        farmerLat: null, farmerLng: null, locationName: '',
    });
    const [gpsLoading, setGpsLoading] = useState(false);
    const [gpsError, setGpsError] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState([]);
    const [error, setError] = useState('');
    const [showMap, setShowMap] = useState(false);
    const [mapOpen, setMapOpen] = useState(false);
    const [peakDay, setPeakDay] = useState(null);

    const handleChange = (e) => {
        setForm(f => ({ ...f, [e.target.name]: e.target.value }));
        // Fetch crop insights when crop type changes
        if (e.target.name === 'cropType' && e.target.value) {
            api.get(`/farmer/insights/${e.target.value}`)
                .then(({ data }) => {
                    if (data.insights && data.insights.length > 0) {
                        // Find day with highest average price
                        const best = data.insights.reduce((a, b) => a.avgPrice > b.avgPrice ? a : b);
                        setPeakDay(best.day);
                    } else {
                        setPeakDay(null);
                    }
                })
                .catch(() => setPeakDay(null));
        }
    };

    const fetchLocationName = useCallback(async (lat, lng, lang) => {
        try {
            const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=${lang}`);
            const data = await resp.json();
            return data.address?.village || data.address?.town || data.address?.city || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        } catch (err) {
            console.error('Reverse geocode error:', err);
            return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        }
    }, []);

    // Sync location name when language changes
    useEffect(() => {
        if (form.farmerLat && form.farmerLng) {
            fetchLocationName(form.farmerLat, form.farmerLng, i18n.language)
                .then(locationName => setForm(f => ({ ...f, locationName })));
        }
    }, [i18n.language, form.farmerLat, form.farmerLng, fetchLocationName]);





    const detectLocation = () => {
        setGpsLoading(true); setGpsError('');
        if (!navigator.geolocation) {
            setGpsError(t('farmer.locationError'));
            setGpsLoading(false); return;
        }
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                const locationName = await fetchLocationName(lat, lng, i18n.language);
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

    const handleMapPick = async (lat, lng) => {
        const locationName = await fetchLocationName(lat, lng, i18n.language);
        setForm(f => ({ ...f, farmerLat: lat, farmerLng: lng, locationName }));
        setMapOpen(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.farmerLat || !form.farmerLng) return setError(t('farmer.detectFirst'));
        setLoading(true); setError(''); setResults([]);
        try {
            const qtyInQtl = unit === 'kg' ? Number(form.quantity) / 100 : Number(form.quantity);
            const { data } = await api.post('/farmer/optimize', {
                farmerLat: form.farmerLat, farmerLng: form.farmerLng,
                farmerLocationName: form.locationName,
                cropType: form.cropType, quantity: qtyInQtl,
                vehicleType: form.vehicleType,
                travelDate: form.travelDate,
            });
            setResults(data.results);
            setShowMap(true);
            setTimeout(() => document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' }), 200);
        } catch (err) {
            console.error('Optimization error:', err);
            if (!err.response) {
                setError(t('common.networkError'));
            } else {
                setError(err.response?.data?.error || t('farmer.optimizeError'));
            }
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
            <Card sx={{
                mb: 4,
                borderRadius: 4,
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                border: '1px solid',
                borderColor: 'divider'
            }}>
                <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
                    <Typography variant="h5" fontWeight={800} mb={4} display="flex" alignItems="center" gap={1.5} color="primary.dark">
                        <Agriculture sx={{ fontSize: 32 }} /> {t('farmer.optimizeTitle')}
                    </Typography>

                    <Box component="form" onSubmit={handleSubmit}>
                        <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1.2fr 1fr 1fr' }} gap={4} mb={4}>
                            {/* Column 1: Crop Selection */}
                            <Box>
                                <Typography variant="subtitle2" fontWeight={700} color="text.secondary" mb={1} ml={0.5}>
                                    {t('farmer.cropType')} *
                                </Typography>
                                <TextField
                                    select name="cropType" fullWidth
                                    value={form.cropType} onChange={handleChange} required
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'action.hover' } }}
                                >
                                    {CROPS.map(c => <MenuItem key={c} value={c}>{t(`crops.${c}`)}</MenuItem>)}
                                </TextField>
                            </Box>

                            {/* Column 2: Quantity & Unit */}
                            <Box>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1} ml={0.5}>
                                    <Typography variant="subtitle2" fontWeight={700} color="text.secondary">
                                        {t('farmer.quantity')} *
                                    </Typography>
                                    <ToggleButtonGroup
                                        value={unit}
                                        exclusive
                                        onChange={(e, next) => next && setUnit(next)}
                                        size="small"
                                        sx={{
                                            height: 28,
                                            '& .MuiToggleButton-root': {
                                                px: 1.5,
                                                fontSize: '0.7rem',
                                                fontWeight: 800,
                                                borderRadius: 2,
                                                border: 'none',
                                                '&.Mui-selected': { bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }
                                            }
                                        }}
                                    >
                                        <ToggleButton value="qtl">{t('unit.qtlShort')}</ToggleButton>
                                        <ToggleButton value="kg">{t('unit.kgShort')}</ToggleButton>
                                    </ToggleButtonGroup>
                                </Box>
                                <TextField
                                    name="quantity" type="number" fullWidth
                                    value={form.quantity} onChange={handleChange} required
                                    inputProps={{ min: 0.1, max: 10000, step: 0.1 }}
                                    placeholder="Enter amount"
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'action.hover' } }}
                                    helperText={unit === 'qtl' ? t('unit.hint') : null}
                                />
                            </Box>

                            {/* Column 3: Vehicle Selection */}
                            <Box>
                                <Typography variant="subtitle2" fontWeight={700} color="text.secondary" mb={1} ml={0.5}>
                                    {t('farmer.vehicleType')} *
                                </Typography>
                                <TextField
                                    select name="vehicleType" fullWidth
                                    value={form.vehicleType} onChange={handleChange} required
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'action.hover' } }}
                                >
                                    {VEHICLES.map(v => <MenuItem key={v.value} value={v.value}>{t(v.label)}</MenuItem>)}
                                </TextField>
                            </Box>
                        </Box>

                        <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 2fr' }} gap={4} mb={4} alignItems="flex-start">
                            {/* Travel Date */}
                            <Box>
                                <Typography variant="subtitle2" fontWeight={700} color="text.secondary" mb={1} ml={0.5}>
                                    {t('farmer.travelDate')} *
                                </Typography>
                                <TextField
                                    name="travelDate" type="date" fullWidth
                                    value={form.travelDate} onChange={handleChange} required
                                    InputLabelProps={{ shrink: true }}
                                    inputProps={{ min: new Date().toISOString().split('T')[0] }}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'action.hover' } }}
                                />
                            </Box>

                            {/* Location Selection */}
                            <Box>
                                <Typography variant="subtitle2" fontWeight={700} color="text.secondary" mb={1} ml={0.5}>
                                    {t('farmer.location')} *
                                </Typography>
                                <Box display="flex" flexWrap="wrap" gap={2}>
                                    <Button
                                        variant="contained"
                                        onClick={detectLocation}
                                        disabled={gpsLoading}
                                        startIcon={gpsLoading ? <CircularProgress size={18} color="inherit" /> : <MyLocation />}
                                        sx={{ borderRadius: 3, px: 3, bgcolor: 'primary.light', color: 'primary.contrastText', '&:hover': { bgcolor: 'primary.main' } }}
                                    >
                                        {gpsLoading ? t('farmer.detecting') : t('farmer.detectLocation')}
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        color="secondary"
                                        onClick={() => setMapOpen(!mapOpen)}
                                        startIcon={<MapIcon />}
                                        sx={{ borderRadius: 3, px: 3, borderWidth: 2, '&:hover': { borderWidth: 2 } }}
                                    >
                                        {mapOpen ? t('farmer.closeMap') : t('farmer.pickOnMap')}
                                    </Button>
                                    {form.locationName && (
                                        <Chip
                                            label={form.locationName}
                                            color="success"
                                            sx={{ fontWeight: 800, height: 42, px: 1, borderRadius: 3, fontSize: '0.9rem' }}
                                        />
                                    )}
                                </Box>
                            </Box>
                        </Box>

                        {/* Map Picker Panel */}
                        {mapOpen && (
                            <Box sx={{ mb: 4, border: '2px solid', borderColor: 'divider', borderRadius: 4, overflow: 'hidden' }}>
                                <Box sx={{ bgcolor: 'action.hover', p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                                    <Typography variant="body2" fontWeight={700} color="text.secondary">
                                        📍 {t('farmer.mapHint')}
                                    </Typography>
                                </Box>
                                <Box sx={{ height: 400 }}>
                                    <LocationPickerMap
                                        position={form.farmerLat && form.farmerLng ? [form.farmerLat, form.farmerLng] : null}
                                        onPick={handleMapPick}
                                        height="400px"
                                    />
                                </Box>
                            </Box>
                        )}

                        {gpsError && <Alert severity="warning" sx={{ mb: 3, borderRadius: 3 }}>{gpsError}</Alert>}
                        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>{error}</Alert>}

                        <Divider sx={{ mb: 4 }} />

                        <Box display="flex" justifyContent="center">
                            <Button
                                type="submit" variant="contained" size="large"
                                disabled={loading || !form.cropType || !form.quantity || !form.vehicleType || !form.farmerLat}
                                startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <TrendingUp sx={{ fontSize: 28 }} />}
                                sx={{
                                    py: 2,
                                    px: 8,
                                    fontSize: '1.2rem',
                                    fontWeight: 900,
                                    borderRadius: 4,
                                    textTransform: 'none',
                                    boxShadow: '0 10px 20px rgba(46, 125, 50, 0.2)',
                                    '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 15px 30px rgba(46, 125, 50, 0.3)' }
                                }}
                            >
                                {loading ? t('farmer.optimizing') : t('farmer.optimize')}
                            </Button>
                        </Box>
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
                                sx={{ bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}
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

                    {/* ── Intelligence Panels ──────────────────────────────── */}
                    <Box mb={1}>
                        <Typography variant="overline" fontWeight={700} color="text.secondary" letterSpacing={1.5}>
                            {t('smart.insights')}
                        </Typography>
                    </Box>

                    {/* Profit Chart */}
                    <Card sx={{ mb: 3, p: 2 }}>
                        <ProfitChart results={results.slice(0, 6)} />
                    </Card>

                    {/* Demand Radar (Restored by user request) */}
                    <DemandRadar results={results} cropType={form.cropType} />

                    {/* ── Mandi Cards ──────────────────────────────────────── */}
                    <Box mb={1}>
                        <Typography variant="overline" fontWeight={700} color="text.secondary" letterSpacing={1.5}>
                            {t('smart.allMandis')}
                        </Typography>
                    </Box>

                    {/* Mandi Cards */}
                    {results.map((mandi, i) => (
                        <MandiCard
                            key={mandi.mandiId || i}
                            mandi={mandi}
                            rank={mandi.rank}
                            peakDay={peakDay}
                            onBook={() => {
                                api.post('/farmer/travel-plan', {
                                    crop: form.cropType,
                                    quantity: unit === 'kg' ? Number(form.quantity) / 100 : Number(form.quantity),
                                    mandiId: mandi.mandiId,
                                    vehicleType: form.vehicleType,
                                    travelDate: form.travelDate,
                                    location: { lat: form.farmerLat, lng: form.farmerLng, name: form.locationName }
                                }).then(() => {
                                    navigate('/farmer/trips');
                                }).catch(err => {
                                    console.error('Booking error:', err);
                                    setError(err.response?.data?.error || t('common.error'));
                                });
                            }}
                        />
                    ))}
                </Box>
            )}

            <Snackbar
                open={Boolean(error)}
                autoHideDuration={6000}
                onClose={() => setError('')}
                message={error}
            />
        </Container>
    );
};

export default OptimizePage;
