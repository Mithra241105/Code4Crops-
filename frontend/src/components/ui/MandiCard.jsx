import React from 'react';
import { Card, CardContent, Box, Typography, Chip, Button, Divider, LinearProgress, Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { TrendingUp, DirectionsCarFilled, LocalShipping, Star, People, TrendingDown, ShowChart } from '@mui/icons-material';
import { useUnit } from '../../contexts/UnitContext';

// India's average diesel price for context comparison
const INDIA_AVG_DIESEL = 92.0;

const MandiCard = ({ mandi, rank, onNavigate, onBook, peakDay }) => {
    const { t } = useTranslation();
    const { fmtPrice, unit } = useUnit();
    const isWinner = rank === 1;
    const profitColor = mandi.netProfit > 0 ? '#2E7D32' : '#C62828';

    const openGoogleMaps = () => {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${mandi.location.lat},${mandi.location.lng}`;
        window.open(url, '_blank');
    };

    // Fuel price comparison with India average
    const fuelDelta = mandi.fuelPrice ? Math.round(mandi.fuelPrice - INDIA_AVG_DIESEL) : null;

    return (
        <Card sx={{
            mb: 3, position: 'relative', overflow: 'visible',
            border: isWinner ? '2px solid' : '1px solid',
            borderColor: isWinner ? 'primary.main' : 'divider',
            boxShadow: isWinner ? 4 : 2,
            transition: 'all 0.3s ease-in-out',
            bgcolor: 'background.paper',
            '&:hover': { boxShadow: 6, transform: 'translateY(-2px)' },
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
                            bgcolor: isWinner ? 'primary.light' : 'action.hover',
                            color: isWinner ? 'primary.contrastText' : 'text.secondary',
                            fontWeight: 900, fontSize: '1.1rem', flexShrink: 0,
                        }}>
                            {rank}
                        </Box>
                        <Box>
                            <Box display="flex" alignItems="center" gap={1}>
                                <Typography variant="h6" fontWeight={700} lineHeight={1.2}>{mandi.mandiName}</Typography>
                                {mandi.profitMargin > 20 && (
                                    <Chip label={t('mandi.margin', { percent: mandi.profitMargin })} size="small" color="success" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }} />
                                )}
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                                {mandi.location?.city && `${mandi.location.city} • `}{mandi.distance} km
                            </Typography>
                        </Box>
                    </Box>
                    <Box textAlign="right">
                        <Typography variant="h5" fontWeight={800} color={profitColor}>
                            ₹{mandi.netProfit.toLocaleString('en-IN')}
                        </Typography>
                    </Box>
                </Box>

                {/* ── Capacity Warning ──────────────────────────────── */}
                {mandi.capacityExceeded && (
                    <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                        {t('mandi.capacityWarning', { vehicle: t(`vehicles.${mandi.vehicleType || 'tractor'}`) })}
                        <strong> {t('mandi.suggestVehicle', { vehicle: t(`vehicles.${mandi.suggestedVehicle || 'tractor'}`) })}</strong>
                    </Alert>
                )}

                {/* ── Feature 1: Ride Share / Pooling ───────────────── */}
                {mandi.hasPoolingOption && (
                    <Box sx={{
                        background: 'linear-gradient(135deg, #1B5E20, #2E7D32)',
                        color: 'white',
                        borderRadius: 2, p: 1.5, mb: 1.5,
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                        <Box display="flex" alignItems="center" gap={1.5}>
                            <People sx={{ fontSize: 22 }} />
                            <Box>
                                <Typography variant="caption" sx={{ opacity: 0.85, fontWeight: 700, display: 'block' }}>
                                    {t('pool.rideShare', { count: mandi.poolingFarmerCount || 1, pct: mandi.poolingSavingsPct || 0 })}
                                </Typography>
                                <Typography variant="body2" fontWeight={800}>
                                    {t('pool.withPooling', { amount: `₹${mandi.netProfitWithPooling?.toLocaleString('en-IN')}` })}
                                </Typography>
                            </Box>
                        </Box>
                        <Chip
                            label={`Save ₹${mandi.poolingSavings?.toLocaleString('en-IN')}`}
                            size="small"
                            sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 800, border: '1px solid rgba(255,255,255,0.4)' }}
                        />
                    </Box>
                )}

                {/* ── Feature 2: Price Volatility Alert ──────────────── */}
                {mandi.isFalling && (
                    <Alert
                        severity="warning"
                        icon={<TrendingDown />}
                        sx={{ mb: 1.5, borderRadius: 2, '& .MuiAlert-message': { fontWeight: 600 } }}
                    >
                        {t('mandi.priceDropDays', { days: mandi.consecutiveDroppingDays || 3 })}
                    </Alert>
                )}

                {/* ── Feature 3: Perishability Warning ───────────────── */}
                {mandi.isPerishableRisk && (
                    <Alert
                        severity={mandi.perishabilityLevel === 'high' ? 'error' : 'warning'}
                        sx={{ mb: 1.5, borderRadius: 2, '& .MuiAlert-message': { fontWeight: 600 } }}
                    >
                        {mandi.perishabilityLevel === 'high'
                            ? t('perishability.highRisk', { km: mandi.distance })
                            : t('perishability.medRisk', { km: mandi.distance })}
                    </Alert>
                )}

                {/* ── Feature 4: Historical Peak Day — Natural Design ─── */}
                {peakDay && (
                    <Box sx={{
                        display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5,
                        px: 2, py: 1.2, borderRadius: 2,
                        background: 'linear-gradient(90deg, rgba(251,191,36,0.08) 0%, rgba(16,185,129,0.06) 100%)',
                        border: '1px solid rgba(251,191,36,0.3)',
                        position: 'relative', overflow: 'hidden'
                    }}>
                        {/* Subtle animated shimmer bar */}
                        <Box sx={{
                            position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
                            background: 'linear-gradient(180deg, #F59E0B, #10B981)',
                            borderRadius: '2px 0 0 2px'
                        }} />
                        <Box sx={{ display: 'flex', flexDirection: 'column', pl: 0.5 }}>
                            <Typography variant="caption" fontWeight={800} color="#92400E" sx={{ lineHeight: 1.2 }}>
                                {t('insights.peakDay', { day: peakDay })}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                                Based on historical price records at this mandi
                            </Typography>
                        </Box>
                    </Box>
                )}

                {/* Profit bar */}
                <Box mb={2}>
                    <Box display="flex" justifyContent="space-between" mb={0.5}>
                        <Typography variant="caption" fontWeight={700} color="text.secondary">{t('mandi.profitMarginLabel')}</Typography>
                        <Typography variant="caption" fontWeight={700} color={profitColor}>{mandi.profitMargin}%</Typography>
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={Math.max(0, Math.min(100, mandi.profitMargin))}
                        sx={{ height: 6, borderRadius: 3, bgcolor: 'action.hover', '& .MuiLinearProgress-bar': { bgcolor: profitColor, borderRadius: 3 } }}
                    />
                </Box>

                {/* Profit/Cost Breakdown */}
                <Box sx={{ bgcolor: 'action.hover', borderRadius: 3, p: 2, mb: 2, border: '1px solid', borderColor: 'divider' }}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2" color="text.secondary">💰 {t('farmer.revenue')}</Typography>
                        <Typography variant="body2" fontWeight={700} color="#2E7D32">₹{mandi.revenue.toLocaleString('en-IN')}</Typography>
                    </Box>

                    <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2" color="text.secondary">🚧 {t('farmer.handlingCost')}</Typography>
                        <Typography variant="body2" fontWeight={700} color="#C62828">- ₹{mandi.handlingCost.toLocaleString('en-IN')}</Typography>
                    </Box>

                    <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2" color="text.secondary">⛽ {t('mandi.fuelCost')}</Typography>
                        <Typography variant="body2" fontWeight={700} color="#C62828">- ₹{mandi.transportBreakdown?.fuel?.toLocaleString('en-IN') || 0}</Typography>
                    </Box>

                    <Box display="flex" justifyContent="space-between" mb={1.5}>
                        <Typography variant="body2" color="text.secondary">🚛 {t('mandi.driverMaintenance')}</Typography>
                        <Typography variant="body2" fontWeight={700} color="#C62828">- ₹{mandi.transportBreakdown?.driver?.toLocaleString('en-IN') || 0}</Typography>
                    </Box>

                    {/* ── Feature 5: Fuel Price vs India Avg ────────────── */}
                    {mandi.fuelPrice && (
                        <Box sx={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            mb: 1.5, px: 1.5, py: 0.75, borderRadius: 1.5,
                            bgcolor: 'background.paper', border: '1px dashed',
                            borderColor: fuelDelta > 5 ? 'error.light' : fuelDelta < -5 ? 'success.light' : 'warning.light'
                        }}>
                            <Typography variant="caption" fontWeight={700}
                                color={fuelDelta > 5 ? 'error.dark' : fuelDelta < -5 ? 'success.dark' : 'warning.dark'}>
                                ⛽ Diesel ₹{Math.round(mandi.fuelPrice)}/L
                                {mandi.fuelState && mandi.fuelState !== 'default' ? ` (${mandi.fuelState})` : ' (National)'}
                            </Typography>
                            {fuelDelta !== null && (
                                <Chip
                                    label={fuelDelta > 0 ? `▲ ₹${fuelDelta} vs avg` : fuelDelta < 0 ? `▼ ₹${Math.abs(fuelDelta)} vs avg` : `= National avg`}
                                    size="small"
                                    sx={{
                                        height: 20, fontSize: '0.6rem', fontWeight: 800,
                                        bgcolor: fuelDelta > 5 ? 'error.50' : fuelDelta < -5 ? 'success.50' : 'warning.50',
                                        color: fuelDelta > 5 ? 'error.dark' : fuelDelta < -5 ? 'success.dark' : 'warning.dark',
                                    }}
                                />
                            )}
                        </Box>
                    )}

                    <Divider sx={{ mb: 1.5, borderStyle: 'dashed' }} />

                    <Box display="flex" justifyContent="space-between">
                        <Typography variant="body1" fontWeight={800} color={profitColor}>{t('farmer.netProfit')}</Typography>
                        <Typography variant="body1" fontWeight={900} color={profitColor}>₹{mandi.netProfit.toLocaleString('en-IN')}</Typography>
                    </Box>
                </Box>

                {/* Crop price */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="body2" color="text.secondary">
                        {t('farmer.cropPrice')}: <strong>{fmtPrice(mandi.cropPrice)}</strong>
                    </Typography>
                    {mandi.phone && (
                        <Chip label={mandi.phone} size="small" variant="outlined" icon={<span>📞</span>} sx={{ height: 24, fontSize: '0.75rem' }} />
                    )}
                </Box>

                <Divider sx={{ mb: 2 }} />

                {/* Buttons */}
                <Box display="flex" gap={2}>
                    <Button
                        variant="outlined"
                        fullWidth
                        size="medium"
                        onClick={openGoogleMaps}
                        startIcon={<DirectionsCarFilled />}
                        sx={{
                            py: 1, borderRadius: 2, borderColor: 'divider', color: 'text.primary',
                            '&:hover': { bgcolor: 'action.hover', borderColor: 'primary.main' }
                        }}
                    >
                        {t('farmer.navigate')}
                    </Button>
                    <Button
                        variant="contained"
                        fullWidth
                        size="medium"
                        onClick={onBook}
                        startIcon={<LocalShipping />}
                        sx={{
                            py: 1, bgcolor: 'primary.main', borderRadius: 2, boxShadow: 'none', fontWeight: 700,
                            '&:hover': { bgcolor: 'primary.dark', boxShadow: 2 }
                        }}
                    >
                        {mandi.hasPoolingOption
                            ? t('pool.rideShareButton', { pct: mandi.poolingSavingsPct || 0 })
                            : t('farmer.bookAndOpenPool')}
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
};

export default MandiCard;
