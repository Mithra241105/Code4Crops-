import React, { useEffect, useState } from 'react';
import { Container, Box, Typography, Card, CardContent, CircularProgress, Alert, LinearProgress, Chip } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';

const MandiAnalyticsPage = () => {
    const { t } = useTranslation();
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetch = async () => {
            try {
                const { data } = await api.get('/mandi/admin/analytics');
                setAnalytics(data.analytics);
            } catch (err) {
                setError(err.response?.data?.error || 'Failed to load analytics.');
            } finally { setLoading(false); }
        };
        fetch();
    }, []);

    if (loading) return <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>;

    if (!analytics) return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Alert severity="info">Complete your mandi profile first to view analytics.</Alert>
        </Container>
    );

    const priceChartData = Object.entries(analytics.cropPrices || {}).map(([crop, price]) => ({
        crop: t(`crops.${crop}`) || crop,
        price,
    }));

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box mb={4}>
                <Typography variant="h4" fontWeight={800}>{t('mandi.analytics')}</Typography>
                <Typography variant="body2" color="text.secondary">{analytics.mandiName}</Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {/* Stats */}
            <Box display="grid" gridTemplateColumns={{ xs: '1fr 1fr', sm: '1fr 1fr 1fr' }} gap={2} mb={3}>
                <Card sx={{ textAlign: 'center', p: 2.5 }}>
                    <Typography variant="h3" fontWeight={800} color="primary">{analytics.demandScore}</Typography>
                    <Typography variant="body2" color="text.secondary">{t('mandi.demandScore')}</Typography>
                    <LinearProgress variant="determinate" value={analytics.demandScore}
                        sx={{ mt: 1, height: 6, borderRadius: 3, '& .MuiLinearProgress-bar': { bgcolor: '#2E7D32' } }} />
                </Card>
                <Card sx={{ textAlign: 'center', p: 2.5 }}>
                    <Typography variant="h3" fontWeight={800} color="#F57F17">₹{analytics.handlingRate}</Typography>
                    <Typography variant="body2" color="text.secondary">Handling Rate /qtl</Typography>
                </Card>
                <Card sx={{ textAlign: 'center', p: 2.5 }}>
                    <Typography variant="h3" fontWeight={800} color="#1565C0">{analytics.cropCount}</Typography>
                    <Typography variant="body2" color="text.secondary">{t('mandi.supportedCrops')}</Typography>
                </Card>
            </Box>

            {/* Price chart */}
            {priceChartData.length > 0 && (
                <Card sx={{ mb: 3 }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" fontWeight={700} mb={2}>Crop Prices Today (₹/quintal)</Typography>
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={priceChartData} margin={{ top: 5, right: 10, left: 10, bottom: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                                <XAxis dataKey="crop" tick={{ fontSize: 11 }} angle={-35} textAnchor="end" />
                                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v / 1000).toFixed(1)}k`} />
                                <Tooltip formatter={(v) => `₹${v.toLocaleString('en-IN')}`} />
                                <Bar dataKey="price" fill="#2E7D32" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            )}

            {/* Location */}
            {analytics.location?.lat && (
                <Card>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" fontWeight={700} mb={1}>Location</Typography>
                        <Typography variant="body2" color="text.secondary">
                            {analytics.location.address && `${analytics.location.address}, `}
                            {analytics.location.city && `${analytics.location.city}, `}
                            {analytics.location.state}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Coordinates: {analytics.location.lat?.toFixed(4)}, {analytics.location.lng?.toFixed(4)}
                        </Typography>
                    </CardContent>
                </Card>
            )}
        </Container>
    );
};

export default MandiAnalyticsPage;
