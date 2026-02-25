import React, { useEffect, useState } from 'react';
import { Container, Box, Typography, Card, CardContent, Chip, CircularProgress, Alert, Divider } from '@mui/material';
import { History, TrendingUp } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';

const HistoryPage = () => {
    const { t } = useTranslation();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetch = async () => {
            try {
                const { data } = await api.get('/farmer/history');
                setHistory(data.history);
            } catch (err) {
                setError('Failed to load history.');
            } finally { setLoading(false); }
        };
        fetch();
    }, []);

    if (loading) return <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>;

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box mb={4}>
                <Typography variant="h4" fontWeight={800} display="flex" alignItems="center" gap={1}>
                    <History color="primary" /> {t('farmer.history')}
                </Typography>
                <Typography variant="body2" color="text.secondary">Your past route optimizations</Typography>
            </Box>

            {error && <Alert severity="error" mb={2}>{error}</Alert>}

            {history.length === 0 ? (
                <Card>
                    <CardContent sx={{ textAlign: 'center', py: 8 }}>
                        <TrendingUp sx={{ fontSize: 64, color: '#C8E6C9', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary">{t('farmer.noHistory')}</Typography>
                        <Typography variant="body2" color="text.secondary">Run an optimization to see results here</Typography>
                    </CardContent>
                </Card>
            ) : (
                history.map((item) => (
                    <Card key={item._id} sx={{ mb: 2 }}>
                        <CardContent sx={{ p: 2.5 }}>
                            <Box display="flex" justifyContent="space-between" flexWrap="wrap" gap={1} mb={1}>
                                <Box display="flex" gap={1} flexWrap="wrap">
                                    <Chip label={t(`crops.${item.cropType}`) || item.cropType} size="small" color="success" variant="outlined" />
                                    <Chip label={`${item.quantity} quintals`} size="small" />
                                    <Chip label={t(`vehicles.${item.vehicleType}`) || item.vehicleType} size="small" />
                                </Box>
                                <Typography variant="caption" color="text.secondary">
                                    {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </Typography>
                            </Box>
                            <Divider sx={{ my: 1 }} />
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="body2" color="text.secondary">
                                    Best: <strong>{item.bestMandi?.name}</strong>
                                </Typography>
                                <Typography variant="body1" fontWeight={700} color="primary.main">
                                    ₹{item.bestMandi?.netProfit?.toLocaleString('en-IN')} profit
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                ))
            )}
        </Container>
    );
};

export default HistoryPage;
