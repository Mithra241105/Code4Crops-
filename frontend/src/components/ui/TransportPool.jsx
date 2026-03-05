import React, { useState } from 'react';
import {
    Box, Card, CardContent, Typography, Chip,
    Button, Avatar, AvatarGroup, Collapse, Alert, Divider
} from '@mui/material';
import { People, LocalShipping, SavingsOutlined, ExpandMore, ExpandLess, DirectionsCar, Phone, LocationOn, Agriculture } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useUnit } from '../../contexts/UnitContext';

const POOL_AVATARS = ['#66BB6A', '#42A5F5', '#FF7043', '#AB47BC', '#26A69A'];

// ─── Main Component ─────────────────────────────────────────────────
// Props:
//   mandi        - the full mandi result object from the optimize API (has hasPoolingOption, poolingPartners, etc.)
//   onJoinPool   - callback to call POST /api/farmer/travel-plan (provided by parent)
//   joining      - boolean, true while the API call is in flight
const TransportPool = ({ mandi, onJoinPool, joining }) => {
    const { t } = useTranslation();
    const { fmtQty } = useUnit();
    const [expanded, setExpanded] = useState(false);
    const [joined, setJoined] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    if (dismissed || !mandi || !mandi.hasPoolingOption) return null;

    const partners = mandi.poolingPartners || [];
    const savings = mandi.poolingSavings || 0;
    const poolSize = mandi.poolingFarmerCount || partners.length;
    const savingsPct = mandi.poolingSavingsPct || 0;

    const handleJoin = async () => {
        await onJoinPool();
        setJoined(true);
    };

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
                    label={t('pool.farmersNearby', { count: poolSize })}
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
                            {t('pool.joinedDesc', { amount: `₹${savings.toLocaleString('en-IN')}` })}
                        </Typography>
                    </Alert>
                ) : (
                    <>
                        {/* Stats row */}
                        <Box display="grid" gridTemplateColumns={{ xs: '1fr 1fr', sm: '1fr 1fr 1fr' }} gap={2} mb={2.5}>
                            {[
                                { icon: <People sx={{ color: '#1565C0' }} />, value: t('pool.farmersNearby', { count: poolSize }), label: t('pool.headingSameWay') },
                                { icon: <SavingsOutlined sx={{ color: '#2E7D32' }} />, value: `₹${savings.toLocaleString('en-IN')}`, label: t('pool.estSavings') },
                                { icon: <LocalShipping sx={{ color: '#F57F17' }} />, value: `${savingsPct}%`, label: t('pool.vehicleCapacity') },
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
                            {t('pool.headingToLabel')}
                        </Typography>
                        <Typography variant="body1" fontWeight={700} sx={{ mb: 2 }}>
                            {mandi.mandiName}
                        </Typography>

                        {/* Farmer avatars */}
                        {partners.length > 0 && (
                            <Box display="flex" alignItems="center" gap={1.5} mb={2.5}>
                                <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 32, height: 32, fontSize: '0.7rem', fontWeight: 700 } }}>
                                    {partners.map((f, i) => (
                                        <Avatar key={i} sx={{ bgcolor: POOL_AVATARS[i % POOL_AVATARS.length] }}>
                                            {(f.name || 'F')[0]}
                                        </Avatar>
                                    ))}
                                </AvatarGroup>
                                <Typography variant="body2" color="text.secondary">
                                    {partners[0]?.name?.split(' ')[0]}
                                    {poolSize > 1 ? ` +${poolSize - 1}` : ''}
                                </Typography>
                            </Box>
                        )}

                        {/* Expandable details — real partner data */}
                        <Collapse in={expanded}>
                            <Box mb={2} sx={{ borderRadius: 2, bgcolor: '#F8F9FA', border: '1px solid #EEEEEE', overflow: 'hidden' }}>
                                {partners.length > 0 ? partners.map((f, i) => (
                                    <Box key={i} px={2} py={1.5}
                                        sx={{ borderBottom: i < partners.length - 1 ? '1px solid #EEEEEE' : 'none' }}>
                                        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                            <Box display="flex" alignItems="center" gap={1.5}>
                                                <Avatar sx={{ width: 28, height: 28, bgcolor: POOL_AVATARS[i % POOL_AVATARS.length], fontSize: '0.65rem', fontWeight: 700 }}>
                                                    {(f.name || 'F')[0]}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="body2" fontWeight={700}>{f.name}</Typography>
                                                    <Box display="flex" alignItems="center" gap={0.5}>
                                                        <Agriculture sx={{ fontSize: 12, color: 'text.secondary' }} />
                                                        <Typography variant="caption" color="text.secondary">
                                                            {f.crop} • {fmtQty(f.quantity)}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Box>
                                            <Box textAlign="right">
                                                <Box display="flex" alignItems="center" gap={0.5}>
                                                    <Phone sx={{ fontSize: 12, color: 'success.main' }} />
                                                    <Typography variant="caption" fontWeight={700} color="success.main">
                                                        {f.phone}
                                                    </Typography>
                                                </Box>
                                                <Box display="flex" alignItems="center" gap={0.5} justifyContent="flex-end">
                                                    <LocationOn sx={{ fontSize: 12, color: 'text.secondary' }} />
                                                    <Typography variant="caption" color="text.secondary">
                                                        {f.from}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Box>
                                )) : (
                                    <Box px={2} py={2}>
                                        <Typography variant="body2" color="text.secondary" textAlign="center">
                                            Partner details will be shown after booking.
                                        </Typography>
                                    </Box>
                                )}
                                <Box px={2} py={1.5} sx={{ bgcolor: '#E8F5E9' }}>
                                    <Box display="flex" justifyContent="space-between">
                                        <Typography variant="caption" fontWeight={700}>{t('pool.yourSoloCost')}</Typography>
                                        <Typography variant="caption" fontWeight={700}
                                            sx={{ textDecoration: 'line-through', color: '#B71C1C' }}>
                                            ₹{(mandi.transportCost || 0).toLocaleString('en-IN')}
                                        </Typography>
                                    </Box>
                                    <Box display="flex" justifyContent="space-between">
                                        <Typography variant="caption" fontWeight={700}>{t('pool.pooledCost')}</Typography>
                                        <Typography variant="caption" fontWeight={800} color="success.main">
                                            ₹{((mandi.transportCost || 0) - savings).toLocaleString('en-IN')}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Collapse>

                        {/* Action buttons */}
                        <Box display="flex" flexWrap="wrap" gap={1.5} alignItems="center">
                            <Button variant="contained" size="medium" startIcon={<People />}
                                onClick={handleJoin}
                                disabled={joining}
                                sx={{ bgcolor: '#1565C0', '&:hover': { bgcolor: '#0D47A1' }, borderRadius: 2, fontWeight: 700, px: 2.5 }}>
                                {joining ? 'Booking...' : t('pool.joinPool')}
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
