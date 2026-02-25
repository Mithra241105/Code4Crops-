import React from 'react';
import { Card, CardContent, Box, Typography, Chip, Button, Divider, LinearProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { TrendingUp, DirectionsCarFilled, LocalShipping, Star } from '@mui/icons-material';
import { useUnit } from '../../contexts/UnitContext';

const MandiCard = ({ mandi, rank, onNavigate }) => {
    const { t } = useTranslation();
    const { fmtPrice } = useUnit();
    const isWinner = rank === 1;
    const profitColor = mandi.netProfit > 0 ? '#2E7D32' : '#C62828';

    const openGoogleMaps = () => {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${mandi.location.lat},${mandi.location.lng}`;
        window.open(url, '_blank');
    };

    return (
        <Card sx={{
            mb: 2, position: 'relative', overflow: 'visible',
            border: isWinner ? '2px solid #2E7D32' : '1px solid rgba(0,0,0,0.08)',
            boxShadow: isWinner ? '0 8px 32px rgba(46,125,50,0.15)' : '0 2px 12px rgba(0,0,0,0.08)',
            transition: 'box-shadow 0.2s ease, transform 0.2s ease',
            '&:hover': { boxShadow: '0 12px 32px rgba(0,0,0,0.12)', transform: 'translateY(-2px)' },
        }}>
            {isWinner && (
                <Chip
                    icon={<Star sx={{ fontSize: '16px !important' }} />}
                    label={t('farmer.bestChoice')}
                    size="small"
                    sx={{ position: 'absolute', top: -10, right: 16, bgcolor: '#2E7D32', color: 'white', fontWeight: 700, zIndex: 1 }}
                />
            )}
            <CardContent sx={{ p: 2.5 }}>
                {/* Header row */}
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
                    <Box display="flex" alignItems="center" gap={1.5}>
                        <Box sx={{
                            width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            bgcolor: isWinner ? '#E8F5E9' : '#F5F5F5', color: isWinner ? '#2E7D32' : '#666',
                            fontWeight: 900, fontSize: '1.1rem', flexShrink: 0,
                        }}>
                            {rank}
                        </Box>
                        <Box>
                            <Typography variant="h6" fontWeight={700} lineHeight={1.2}>{mandi.mandiName}</Typography>
                            <Typography variant="caption" color="text.secondary">
                                {mandi.location?.city && `${mandi.location.city} • `}{mandi.distance} km
                            </Typography>
                        </Box>
                    </Box>
                    <Box textAlign="right">
                        <Typography variant="h5" fontWeight={800} color={profitColor}>
                            ₹{mandi.netProfit.toLocaleString('en-IN')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">{t('farmer.netProfit')}</Typography>
                    </Box>
                </Box>

                {/* Profit bar */}
                <Box mb={2}>
                    <LinearProgress
                        variant="determinate"
                        value={Math.max(0, Math.min(100, (mandi.netProfit / (mandi.revenue || 1)) * 100))}
                        sx={{ height: 6, borderRadius: 3, bgcolor: '#E8F5E9', '& .MuiLinearProgress-bar': { bgcolor: profitColor, borderRadius: 3 } }}
                    />
                </Box>

                {/* Cost breakdown */}
                <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap={1} mb={2}>
                    <Box sx={{ bgcolor: '#F3F4F6', borderRadius: 2, p: 1.5, textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary" display="block">{t('farmer.revenue')}</Typography>
                        <Typography variant="body2" fontWeight={700} color="#2E7D32">₹{mandi.revenue.toLocaleString('en-IN')}</Typography>
                    </Box>
                    <Box sx={{ bgcolor: '#F3F4F6', borderRadius: 2, p: 1.5, textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary" display="block">{t('farmer.transportCost')}</Typography>
                        <Typography variant="body2" fontWeight={700} color="#C62828">-₹{mandi.transportCost.toLocaleString('en-IN')}</Typography>
                    </Box>
                    <Box sx={{ bgcolor: '#F3F4F6', borderRadius: 2, p: 1.5, textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary" display="block">{t('farmer.handlingCost')}</Typography>
                        <Typography variant="body2" fontWeight={700} color="#C62828">-₹{mandi.handlingCost.toLocaleString('en-IN')}</Typography>
                    </Box>
                </Box>

                {/* Crop price */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="body2" color="text.secondary">
                        {t('farmer.cropPrice')}: <strong>{fmtPrice(mandi.cropPrice)}</strong>
                    </Typography>
                    {mandi.phone && (
                        <Typography variant="caption" color="text.secondary">📞 {mandi.phone}</Typography>
                    )}
                </Box>

                <Divider sx={{ mb: 2 }} />

                {/* Navigate button */}
                <Button
                    variant={isWinner ? 'contained' : 'outlined'}
                    fullWidth
                    size="large"
                    onClick={openGoogleMaps}
                    startIcon={<DirectionsCarFilled />}
                    sx={{ py: 1.2 }}
                >
                    {t('farmer.navigate')}
                </Button>
            </CardContent>
        </Card>
    );
};

export default MandiCard;
