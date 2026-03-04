import React, { useEffect, useState } from 'react';
import { Container, Box, Typography, Card, CardContent, Chip, CircularProgress, Alert, Divider } from '@mui/material';
import { History, TrendingUp } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useUnit } from '../../contexts/UnitContext';
import api from '../../services/api';

const HistoryPage = () => {
    const { t, i18n } = useTranslation();
    const { fmtQty, fmtPrice } = useUnit();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetch = async () => {
            try {
                const { data } = await api.get('/farmer/history');
                setHistory(data.history || []);
            } catch (err) {
                setError(t('common.error'));
            } finally { setLoading(false); }
        };
        fetch();
    }, [t]);

    if (loading) return <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>;

    const dateLocale = i18n.language === 'hi' ? 'hi-IN' :
        i18n.language === 'ta' ? 'ta-IN' :
            i18n.language === 'te' ? 'te-IN' :
                i18n.language === 'mr' ? 'mr-IN' :
                    i18n.language === 'ur' ? 'ur-PK' :
                        i18n.language === 'ml' ? 'ml-IN' : 'en-IN';

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box mb={4}>
                <Typography variant="h4" fontWeight={800} display="flex" alignItems="center" gap={1}>
                    <History color="primary" /> {t('farmer.history')}
                </Typography>
                <Typography variant="body2" color="text.secondary">{t('farmer.historySubtitle')}</Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {history.length === 0 ? (
                <Card sx={{ borderRadius: 4 }}>
                    <CardContent sx={{ textAlign: 'center', py: 8 }}>
                        <TrendingUp sx={{ fontSize: 64, color: 'action.disabled', mb: 2, opacity: 0.3 }} />
                        <Typography variant="h6" color="text.secondary" fontWeight={700}>{t('farmer.noHistory')}</Typography>
                        <Typography variant="body2" color="text.secondary">{t('farmer.noHistorySubtitle')}</Typography>
                    </CardContent>
                </Card>
            ) : (
                history.map((item) => (
                    <Card key={item._id} sx={{ mb: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                        <CardContent sx={{ p: 2.5 }}>
                            <Box display="flex" justifyContent="space-between" flexWrap="wrap" gap={1} mb={1}>
                                <Box display="flex" gap={1} flexWrap="wrap">
                                    <Chip label={t(`crops.${item.cropType}`) || item.cropType} size="small" color="success" variant="outlined" sx={{ fontWeight: 700 }} />
                                    <Chip label={fmtQty(item.quantity)} size="small" sx={{ fontWeight: 600 }} />
                                    <Chip label={t(`vehicles.${item.vehicleType}`) || item.vehicleType} size="small" sx={{ fontWeight: 600 }} />
                                </Box>
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                    {new Date(item.createdAt).toLocaleDateString(dateLocale, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </Typography>
                            </Box>
                            <Divider sx={{ my: 1.5 }} />
                            <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                    {t('farmer.bestMandiLabel')} <strong>{item.bestMandi?.name || t('common.unknownMandi')}</strong>
                                </Typography>
                                <Typography variant="body1" fontWeight={800} color="primary.main">
                                    {item.bestMandi?.netProfit ? `₹${item.bestMandi.netProfit.toLocaleString(dateLocale)}` : 'N/A'} {t('farmer.profitLabel')}
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
