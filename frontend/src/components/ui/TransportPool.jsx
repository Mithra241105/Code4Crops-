import React, { useState, useMemo } from 'react';
import {
    Box, Card, CardContent, Typography, Chip,
    Button, Avatar, AvatarGroup, Collapse, Alert
} from '@mui/material';
import { People, LocalShipping, SavingsOutlined, ExpandMore, ExpandLess, DirectionsCar } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useUnit } from '../../contexts/UnitContext';

// ─── Simulation engine ─────────────────────────────────────────────
const FARMER_NAMES = [
    'Rajesh Kumar', 'Priya Devi', 'Suresh Patel', 'Meena Singh',
    'Ramesh Yadav', 'Lakshmi Bai', 'Vijay Sharma', 'Anita Reddy',
    'Gurpreet Kaur', 'Dilip Naik',
];
const POOL_AVATARS = ['#66BB6A', '#42A5F5', '#FF7043', '#AB47BC', '#26A69A'];

function simulatePool(bestMandi, cropType, vehicleType, quantity) {
    const seed = (bestMandi?.mandiName?.length || 0) + (cropType?.length || 0) + new Date().getHours();
    const poolSize = 2 + (seed % 3);
    const farmers = [];
    for (let i = 0; i < poolSize; i++) {
        const nameIdx = (seed + i * 7) % FARMER_NAMES.length;
        const qty = 5 + ((seed + i * 3) % 20);
        const dist = 4 + ((seed + i * 5) % 18);
        farmers.push({ name: FARMER_NAMES[nameIdx], qty, dist, color: POOL_AVATARS[i % POOL_AVATARS.length] });
    }
    const totalQty = quantity + farmers.reduce((s, f) => s + f.qty, 0);
    const capacities = { bike: 2, auto: 8, miniTruck: 40, largeTruck: 150, tractor: 60 };
    const cap = capacities[vehicleType] || 40;
    const poolFill = Math.min(100, Math.round((totalQty / cap) * 100));
    const ratePerQtlKm = { bike: 1.2, auto: 1.8, miniTruck: 2.5, largeTruck: 1.5, tractor: 2.0 };
    const rate = ratePerQtlKm[vehicleType] || 2.0;
    const dist = bestMandi?.distance || 30;
    const soloCost = Math.round(quantity * dist * rate);
    const poolCost = Math.round(soloCost / (poolSize + 1));
    const savings = soloCost - poolCost;
    return { farmers, totalQty, poolFill, soloCost, poolCost, savings, poolSize };
}

// ─── Main Component ─────────────────────────────────────────────────

const TransportPool = ({ bestMandi, cropType, vehicleType, quantity }) => {
    const { t } = useTranslation();
    const { unit, fmtQty } = useUnit();
    const [joined, setJoined] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    const pool = useMemo(
        () => simulatePool(bestMandi, cropType, vehicleType, quantity),
        [bestMandi, cropType, vehicleType, quantity]
    );

    if (dismissed || !bestMandi) return null;

    return (
        <Card elevation={0} sx={{ border: '1.5px solid rgba(21,101,192,0.2)', borderRadius: 3, mb: 3, overflow: 'hidden' }}>
            {/* Header */}
            <Box sx={{
                background: 'linear-gradient(135deg, #0D47A1 0%, #1565C0 100%)', px: 2.5, py: 2,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
                <Box display="flex" alignItems="center" gap={1}>
                    <People sx={{ color: '#90CAF9', fontSize: 22 }} />
                    <Typography variant="h6" fontWeight={800} color="white" fontSize="1rem">
                        {t('pool.title')}
                    </Typography>
                </Box>
                <Chip
                    label={t('pool.farmersNearby', { count: pool.poolSize })}
                    size="small"
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 700, fontSize: '0.72rem' }}
                />
            </Box>

            <CardContent sx={{ p: 2.5 }}>
                {joined ? (
                    <Alert severity="success" icon={<LocalShipping />} sx={{ borderRadius: 2 }}
                        onClose={() => { setJoined(false); setDismissed(true); }}>
                        <Typography fontWeight={700}>{t('pool.joinedTitle')}</Typography>
                        <Typography variant="caption">
                            {t('pool.joinedDesc', { amount: `₹${pool.savings.toLocaleString('en-IN')}` })}
                        </Typography>
                    </Alert>
                ) : (
                    <>
                        {/* Stats row */}
                        <Box display="grid" gridTemplateColumns={{ xs: '1fr 1fr', sm: '1fr 1fr 1fr' }} gap={2} mb={2.5}>
                            {[
                                { icon: <People sx={{ color: '#1565C0' }} />, value: t('pool.farmersNearby', { count: pool.poolSize }), label: t('pool.headingSameWay') },
                                { icon: <SavingsOutlined sx={{ color: '#2E7D32' }} />, value: `₹${pool.savings.toLocaleString('en-IN')}`, label: t('pool.estSavings') },
                                { icon: <LocalShipping sx={{ color: '#F57F17' }} />, value: `${pool.poolFill}%`, label: t('pool.vehicleCapacity') },
                            ].map((stat, i) => (
                                <Box key={i} display="flex" alignItems="center" gap={1.5}
                                    sx={{ p: 1.5, borderRadius: 2, bgcolor: '#FAFAFA', border: '1px solid #F0F0F0' }}>
                                    {stat.icon}
                                    <Box>
                                        <Typography variant="body2" fontWeight={800}>{stat.value}</Typography>
                                        <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
                                    </Box>
                                </Box>
                            ))}
                        </Box>

                        <Typography variant="caption" fontWeight={700} color="text.secondary">
                            {t('pool.headingTo').toUpperCase()}
                        </Typography>
                        <Typography variant="body1" fontWeight={700} sx={{ mb: 2 }}>
                            {bestMandi.mandiName}
                        </Typography>

                        {/* Farmer avatars */}
                        <Box display="flex" alignItems="center" gap={1.5} mb={2.5}>
                            <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 32, height: 32, fontSize: '0.7rem', fontWeight: 700 } }}>
                                {pool.farmers.map((f, i) => (
                                    <Avatar key={i} sx={{ bgcolor: f.color }}>{f.name[0]}</Avatar>
                                ))}
                            </AvatarGroup>
                            <Typography variant="body2" color="text.secondary">
                                {pool.farmers[0]?.name.split(' ')[0]}
                                {pool.poolSize > 1 ? ` +${pool.poolSize - 1}` : ''}
                            </Typography>
                        </Box>

                        {/* Expandable details */}
                        <Collapse in={expanded}>
                            <Box mb={2} sx={{ borderRadius: 2, bgcolor: '#F8F9FA', border: '1px solid #EEEEEE', overflow: 'hidden' }}>
                                {pool.farmers.map((f, i) => (
                                    <Box key={i} display="flex" justifyContent="space-between" alignItems="center"
                                        px={2} py={1.2}
                                        sx={{ borderBottom: i < pool.farmers.length - 1 ? '1px solid #EEEEEE' : 'none' }}>
                                        <Box display="flex" alignItems="center" gap={1.5}>
                                            <Avatar sx={{ width: 28, height: 28, bgcolor: f.color, fontSize: '0.65rem', fontWeight: 700 }}>
                                                {f.name[0]}
                                            </Avatar>
                                            <Typography variant="body2" fontWeight={600}>{f.name}</Typography>
                                        </Box>
                                        <Box textAlign="right">
                                            {/* Convert quantity to selected unit */}
                                            <Typography variant="caption" fontWeight={700}>{fmtQty(f.qty)}</Typography>
                                            <Typography variant="caption" color="text.secondary" display="block">
                                                {t('pool.soloDistance', { dist: f.dist })}
                                            </Typography>
                                        </Box>
                                    </Box>
                                ))}
                                <Box px={2} py={1.5} sx={{ bgcolor: '#E8F5E9' }}>
                                    <Box display="flex" justifyContent="space-between">
                                        <Typography variant="caption" fontWeight={700}>{t('pool.yourSoloCost')}</Typography>
                                        <Typography variant="caption" fontWeight={700}
                                            sx={{ textDecoration: 'line-through', color: '#B71C1C' }}>
                                            ₹{pool.soloCost.toLocaleString('en-IN')}
                                        </Typography>
                                    </Box>
                                    <Box display="flex" justifyContent="space-between">
                                        <Typography variant="caption" fontWeight={700}>{t('pool.pooledCost')}</Typography>
                                        <Typography variant="caption" fontWeight={800} color="success.main">
                                            ₹{pool.poolCost.toLocaleString('en-IN')}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Collapse>

                        {/* Action buttons */}
                        <Box display="flex" flexWrap="wrap" gap={1.5} alignItems="center">
                            <Button variant="contained" size="medium" startIcon={<People />}
                                onClick={() => setJoined(true)}
                                sx={{ bgcolor: '#1565C0', '&:hover': { bgcolor: '#0D47A1' }, borderRadius: 2, fontWeight: 700, px: 2.5 }}>
                                {t('pool.joinPool')}
                            </Button>
                            <Button variant="outlined" size="medium"
                                startIcon={expanded ? <ExpandLess /> : <ExpandMore />}
                                onClick={() => setExpanded(e => !e)}
                                sx={{ borderRadius: 2, fontWeight: 600, color: '#1565C0', borderColor: '#1565C0' }}>
                                {expanded ? t('pool.hideDetails') : t('pool.viewDetails')}
                            </Button>
                            <Button variant="text" size="medium" startIcon={<DirectionsCar />}
                                onClick={() => setDismissed(true)}
                                sx={{ borderRadius: 2, fontWeight: 600, color: 'text.secondary' }}>
                                {t('pool.goSolo')}
                            </Button>
                        </Box>
                    </>
                )}
            </CardContent>
        </Card>
    );
};

export default TransportPool;
