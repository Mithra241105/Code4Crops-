import React, { useEffect, useState } from 'react';
import {
    Container, Box, Typography, Card, CardContent, CircularProgress, Alert,
    LinearProgress, Chip, Divider, Button, Avatar
} from '@mui/material';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer,
    CartesianGrid, PieChart, Pie, Cell, Legend
} from 'recharts';
import {
    TrendingUp, TrendingDown, TrendingFlat, LocalFireDepartment, Lightbulb,
    EmojiEvents, Storefront, Analytics, AttachMoney, Speed, ShowChart, WarningAmber, CheckCircle
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const CROP_EMOJI = {
    wheat: '🌾', rice: '🍚', maize: '🌽', onion: '🧅', potato: '🥔', tomato: '🍅',
    cotton: '🪴', soybean: '🫘', mustard: '🌻', groundnut: '🥜', garlic: '🧄',
    chilli: '🌶️', banana: '🍌', orange: '🍊', millet: '🌾', ragi: '🌿',
    grapes: '🍇', bajra: '🌾', brinjal: '🍆', jute: '🎍', coconut: '🥥', castor: '🪴', guar: '🌿'
};

const PIE_COLORS = ['#1B5E20', '#388E3C', '#4CAF50', '#81C784', '#A5D6A7'];

const TrendArrow = ({ direction }) => {
    if (direction === 'up') return <TrendingUp fontSize="small" sx={{ color: '#2E7D32' }} />;
    if (direction === 'down') return <TrendingDown fontSize="small" sx={{ color: '#C62828' }} />;
    return <TrendingFlat fontSize="small" sx={{ color: '#F57F17' }} />;
};

// Custom X-axis tick that truncates long crop names
const CropAxisTick = ({ x, y, payload }) => (
    <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dy={10} textAnchor="end" fill="currentColor"
            fontSize={10} transform="rotate(-40)">
            {payload.value.length > 8 ? payload.value.slice(0, 7) + '…' : payload.value}
        </text>
    </g>
);

const MandiAnalyticsPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeSection, setActiveSection] = useState('overview');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data } = await api.get('/mandi/admin/analytics');
                setAnalytics(data.analytics);
            } catch (err) {
                setError(err.response?.data?.error || t('mandi.analyticsError'));
            } finally { setLoading(false); }
        };
        fetchData();
    }, []);

    if (loading) return (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="60vh" gap={2}>
            <CircularProgress size={48} thickness={4} />
            <Typography color="text.secondary" fontWeight={600}>{t('analytics.loading')}</Typography>
        </Box>
    );

    if (error || !analytics) return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Alert severity="info" sx={{ borderRadius: 2 }}>{error || t('mandi.completeProfileAnalytics')}</Alert>
        </Container>
    );

    // Safe values with fallbacks for existing DB mandis
    const avgVol = analytics.avgDailyVolume > 0 ? analytics.avgDailyVolume?.toLocaleString('en-IN') : '–';
    const stateRank = analytics.stateRank > 0 ? analytics.stateRank : '–';
    const totalMandis = analytics.totalMandisInState > 0 ? analytics.totalMandisInState : '–';

    const priceChartData = Object.entries(analytics.cropPrices || {})
        .sort((a, b) => b[1] - a[1])
        .map(([crop, price]) => ({
            crop: t(`crops.${crop}`) || crop,
            price,
        }));

    const pieData = (analytics.hotCrops || []).map(({ crop, price }) => ({
        name: `${CROP_EMOJI[crop] || '🌱'} ${t(`crops.${crop}`) || crop}`,
        value: price
    }));

    const trendEntries = Object.entries(analytics.priceTrends || {});
    const risingCrops = trendEntries.filter(([, d]) => d.direction === 'up').length;
    const fallingCrops = trendEntries.filter(([, d]) => d.direction === 'down').length;

    const sections = [
        { id: 'overview', label: t('analytics.overview'), icon: <Analytics fontSize="small" /> },
        { id: 'market', label: t('analytics.marketStats'), icon: <ShowChart fontSize="small" /> },
        { id: 'suggestions', label: t('analytics.priceGuide'), icon: <Lightbulb fontSize="small" /> },
        { id: 'trends', label: t('analytics.trends'), icon: <TrendingUp fontSize="small" /> },
    ];

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>

            {/* ── Hero Header ─────────────────────────────────────── */}
            <Box sx={{
                mb: 4, p: 3, borderRadius: 3,
                background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 60%, #388E3C 100%)',
                color: 'white', position: 'relative', overflow: 'hidden'
            }}>
                <Box sx={{ position: 'absolute', right: -20, top: -20, width: 160, height: 160, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.05)' }} />
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
                    <Box>
                        <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                            <Analytics sx={{ fontSize: 24 }} />
                            <Typography variant="h6" fontWeight={800}>{analytics.mandiName}</Typography>
                            {analytics.stateRank > 0 && analytics.stateRank <= 3 && (
                                <Chip
                                    icon={<EmojiEvents sx={{ fontSize: '14px !important', color: '#FFD700 !important' }} />}
                                    label={`#${analytics.stateRank} ${t('analytics.inState')}`}
                                    size="small"
                                    sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'white', fontWeight: 800 }}
                                />
                            )}
                        </Box>
                        <Typography variant="body2" sx={{ opacity: 0.82 }}>
                            📍 {analytics.location?.city}{analytics.location?.state ? `, ${analytics.location.state}` : ''}
                            {stateRank !== '–' && ` • ${t('analytics.statePosition', { rank: stateRank, total: totalMandis })}`}
                        </Typography>
                    </Box>
                    <Box display="flex" gap={3} flexWrap="wrap" alignItems="flex-end">
                        <Box textAlign="center">
                            <Typography variant="h3" fontWeight={900} lineHeight={1}>{analytics.demandScore ?? '–'}</Typography>
                            <Typography variant="caption" sx={{ opacity: 0.8 }}>{t('mandi.demandScore')}</Typography>
                        </Box>
                        <Box textAlign="center">
                            <Typography variant="h3" fontWeight={900} lineHeight={1}>{analytics.cropCount ?? '–'}</Typography>
                            <Typography variant="caption" sx={{ opacity: 0.8 }}>{t('analytics.cropsListed')}</Typography>
                        </Box>
                        <Box textAlign="center">
                            <Typography variant="h3" fontWeight={900} lineHeight={1}>{avgVol}</Typography>
                            <Typography variant="caption" sx={{ opacity: 0.8 }}>{t('analytics.avgQtlDay')}</Typography>
                        </Box>
                    </Box>
                </Box>
                <LinearProgress variant="determinate" value={analytics.demandScore || 0}
                    sx={{ mt: 2, height: 6, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.2)', '& .MuiLinearProgress-bar': { bgcolor: '#4ADE80' } }} />
            </Box>

            {/* ── Section Nav ─────────────────────────────────────── */}
            <Box display="flex" gap={1} mb={3} sx={{ overflowX: 'auto', pb: 0.5 }}>
                {sections.map(s => (
                    <Button key={s.id} size="small"
                        variant={activeSection === s.id ? 'contained' : 'outlined'}
                        startIcon={s.icon}
                        onClick={() => setActiveSection(s.id)}
                        sx={{ borderRadius: 5, whiteSpace: 'nowrap', fontWeight: 700, px: 2 }}>
                        {s.label}
                    </Button>
                ))}
                <Button size="small" variant="outlined" startIcon={<Analytics />}
                    onClick={() => navigate('/mandi')}
                    sx={{ borderRadius: 5, whiteSpace: 'nowrap', fontWeight: 700, px: 2, ml: 'auto' }}>
                    {t('mandi.updatePrices')}
                </Button>
            </Box>

            {/* ═══════════════════════════════════════════════════════
                TAB 1 — OVERVIEW
            ═══════════════════════════════════════════════════════ */}
            {activeSection === 'overview' && (
                <Box>
                    {/* Stat Cards */}
                    <Box display="grid" gridTemplateColumns={{ xs: '1fr 1fr', md: 'repeat(4, 1fr)' }} gap={2} mb={3}>
                        {[
                            {
                                label: t('mandi.demandScore'), value: `${analytics.demandScore ?? '–'}%`,
                                sub: t('analytics.marketAttractiveness'), icon: <Speed />, color: '#1B5E20'
                            },
                            {
                                label: t('analytics.avgDailyVolumeLabel'), value: avgVol !== '–' ? `${avgVol}` : '–',
                                sub: t('analytics.qtlPerDay'), icon: <Storefront />, color: '#01579B'
                            },
                            {
                                label: t('analytics.stateRankLabel'), value: `#${stateRank}`,
                                sub: stateRank !== '–' ? t('analytics.ofMandis', { total: totalMandis }) : t('analytics.noRankData'),
                                icon: <EmojiEvents />, color: '#E65100'
                            },
                            {
                                label: t('analytics.priceTrendsLabel'),
                                value: `${risingCrops}↑ ${fallingCrops}↓`,
                                sub: t('analytics.risingFalling'), icon: <TrendingUp />, color: '#2E7D32'
                            },
                        ].map((s, i) => (
                            <Card key={i} elevation={0} sx={{
                                border: '1px solid', borderColor: 'divider', borderRadius: 3,
                                borderTop: `3px solid ${s.color}`,
                                '&:hover': { boxShadow: 4, transform: 'translateY(-2px)', transition: 'all 0.2s' }
                            }}>
                                <CardContent sx={{ p: 2.5 }}>
                                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                        <Box>
                                            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                                {s.label}
                                            </Typography>
                                            <Typography variant="h4" fontWeight={900} sx={{ color: s.color, lineHeight: 1.15, mt: 0.5 }}>
                                                {s.value}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">{s.sub}</Typography>
                                        </Box>
                                        <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'action.hover', color: s.color, display: 'flex' }}>
                                            {s.icon}
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        ))}
                    </Box>

                    {/* Market Intelligence Row */}
                    <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: 'repeat(3, 1fr)' }} gap={2} mb={3}>
                        <Card elevation={0} sx={{
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 3,
                            bgcolor: 'background.paper',
                            backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))',
                            transition: 'transform 0.2s',
                            '&:hover': { transform: 'translateY(-4px)' }
                        }}>
                            <CardContent sx={{ p: 2.5 }}>
                                <Box display="flex" alignItems="center" gap={1} mb={1}>
                                    <Avatar sx={{ bgcolor: 'error.lighter', width: 32, height: 32 }}>
                                        <Speed sx={{ color: 'error.main', fontSize: 18 }} />
                                    </Avatar>
                                    <Typography variant="body2" fontWeight={800} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                        {t('analytics.fuelPriceImpact')}
                                    </Typography>
                                </Box>
                                <Typography variant="h5" fontWeight={900}>₹94.20 <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--mui-palette-text-secondary)' }}>Avg Diesel Index</span></Typography>
                                <Typography variant="caption" color="error.main" fontWeight={700}>
                                    {t('analytics.transportCostImpact')}
                                </Typography>
                            </CardContent>
                        </Card>

                        <Card elevation={0} sx={{
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 3,
                            bgcolor: 'background.paper',
                            backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))',
                            transition: 'transform 0.2s',
                            '&:hover': { transform: 'translateY(-4px)' }
                        }}>
                            <CardContent sx={{ p: 2.5 }}>
                                <Box display="flex" alignItems="center" gap={1} mb={1}>
                                    <Avatar sx={{ bgcolor: 'primary.lighter', width: 32, height: 32 }}>
                                        <CheckCircle sx={{ color: 'primary.main', fontSize: 18 }} />
                                    </Avatar>
                                    <Typography variant="body2" fontWeight={800} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                        {t('analytics.competitiveEdge')}
                                    </Typography>
                                </Box>
                                <Typography variant="h5" fontWeight={900} color="primary.main">
                                    {analytics.handlingRate <= 100 ? 'Highest' : analytics.handlingRate <= 150 ? 'Strong' : 'Moderate'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {t('analytics.competitiveDesc') || `Your ₹${analytics.handlingRate} handling rate is better than 65% of mandis.`}
                                </Typography>
                            </CardContent>
                        </Card>

                        <Card elevation={0} sx={{
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 3,
                            bgcolor: 'background.paper',
                            backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))',
                            transition: 'transform 0.2s',
                            '&:hover': { transform: 'translateY(-4px)' }
                        }}>
                            <CardContent sx={{ p: 2.5 }}>
                                <Box display="flex" alignItems="center" gap={1} mb={1}>
                                    <Avatar sx={{ bgcolor: 'secondary.lighter', width: 32, height: 32 }}>
                                        <TrendingUp sx={{ color: 'secondary.main', fontSize: 18 }} />
                                    </Avatar>
                                    <Typography variant="body2" fontWeight={800} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                        {t('analytics.marketSalesPotential')}
                                    </Typography>
                                </Box>
                                <Typography variant="h5" fontWeight={900} color="secondary.main">Very High</Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {t('analytics.potentialDesc') || 'Peak arrivals expected on Wednesdays.'}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Box>

                    {/* Hot Crops + Pie */}
                    <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={3} mb={3}>
                        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                            <CardContent sx={{ p: 3 }}>
                                <Box display="flex" alignItems="center" gap={1} mb={2.5}>
                                    <LocalFireDepartment sx={{ color: '#F57F17' }} />
                                    <Typography variant="h6" fontWeight={800}>{t('analytics.topCrops')}</Typography>
                                </Box>
                                {(analytics.hotCrops || []).length === 0 ? (
                                    <Typography color="text.secondary" variant="body2">{t('analytics.noCropsYet')}</Typography>
                                ) : (analytics.hotCrops || []).map(({ crop, price }, i) => (
                                    <Box key={crop} display="flex" alignItems="center" justifyContent="space-between"
                                        mb={i < analytics.hotCrops.length - 1 ? 1.5 : 0}>
                                        <Box display="flex" alignItems="center" gap={1.5}>
                                            <Box sx={{
                                                width: 36, height: 36, borderRadius: 2, fontSize: '1.1rem',
                                                bgcolor: i === 0 ? '#FFF8E1' : 'action.hover',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}>
                                                {CROP_EMOJI[crop] || '🌱'}
                                            </Box>
                                            <Box>
                                                <Typography variant="body2" fontWeight={700}>{t(`crops.${crop}`)}</Typography>
                                                {analytics.priceTrends?.[crop] && (
                                                    <Box display="flex" alignItems="center" gap={0.5}>
                                                        <TrendArrow direction={analytics.priceTrends[crop].direction} />
                                                        <Typography variant="caption"
                                                            color={analytics.priceTrends[crop].direction === 'up' ? 'success.main' : 'error.main'}
                                                            fontWeight={700}>
                                                            {analytics.priceTrends[crop].direction === 'up' ? '+' : ''}{analytics.priceTrends[crop].changePct}%
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </Box>
                                        </Box>
                                        <Box textAlign="right">
                                            <Typography variant="body1" fontWeight={800} color="primary.main">₹{price.toLocaleString('en-IN')}</Typography>
                                            <Typography variant="caption" color="text.secondary">/qtl</Typography>
                                        </Box>
                                    </Box>
                                ))}
                            </CardContent>
                        </Card>

                        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="h6" fontWeight={800} mb={2}>{t('analytics.priceShareDist')}</Typography>
                                {pieData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={220}>
                                        <PieChart>
                                            <Pie data={pieData} cx="50%" cy="50%" outerRadius={85}
                                                dataKey="value" nameKey="name" labelLine={false}
                                                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}>
                                                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                                            </Pie>
                                            <Legend formatter={v => <span style={{ fontSize: 11 }}>{v}</span>} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <Typography color="text.secondary" variant="body2" mt={4} textAlign="center">{t('analytics.noCropsYet')}</Typography>
                                )}
                            </CardContent>
                        </Card>
                    </Box>
                </Box>
            )}

            {/* ═══════════════════════════════════════════════════════
                TAB 2 — MARKET STATS
            ═══════════════════════════════════════════════════════ */}
            {activeSection === 'market' && (
                <Box>
                    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, mb: 3 }}>
                        <CardContent sx={{ p: 3 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                <Typography variant="h6" fontWeight={800}>{t('analytics.allCropPricesTitle')}</Typography>
                                <Chip label={t('analytics.nCrops', { count: priceChartData.length })} size="small" color="primary" />
                            </Box>
                            {priceChartData.length === 0 ? (
                                <Typography color="text.secondary" textAlign="center" py={4}>{t('analytics.noCropsYet')}</Typography>
                            ) : (
                                <ResponsiveContainer width="100%" height={340}>
                                    <BarChart data={priceChartData} margin={{ top: 16, right: 8, left: 8, bottom: 70 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.1)" />
                                        <XAxis dataKey="crop" tick={<CropAxisTick />} interval={0} height={70} />
                                        <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v / 1000).toFixed(1)}k`} width={55} />
                                        <RTooltip
                                            formatter={(v, name, { payload }) => [`₹${v.toLocaleString('en-IN')} / qtl`, payload.crop]}
                                            contentStyle={{ borderRadius: 8, fontSize: 12 }}
                                        />
                                        <Bar dataKey="price" radius={[5, 5, 0, 0]} fill="url(#greenGradBar)" />
                                        <defs>
                                            <linearGradient id="greenGradBar" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#2E7D32" />
                                                <stop offset="100%" stopColor="#81C784" />
                                            </linearGradient>
                                        </defs>
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>

                    {/* Volume Bars */}
                    {(analytics.peakCropVolumes || []).length > 0 && (
                        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, mb: 3 }}>
                            <CardContent sx={{ p: 3 }}>
                                <Box display="flex" alignItems="center" gap={1} mb={2}>
                                    <Storefront color="primary" />
                                    <Typography variant="h6" fontWeight={800}>{t('analytics.dailyArrivals')}</Typography>
                                </Box>
                                {analytics.peakCropVolumes.map(({ crop, volume }) => {
                                    const maxVol = Math.max(...analytics.peakCropVolumes.map(c => c.volume));
                                    return (
                                        <Box key={crop} mb={1.5}>
                                            <Box display="flex" justifyContent="space-between" mb={0.5}>
                                                <Typography variant="body2" fontWeight={600}>
                                                    {CROP_EMOJI[crop]} {t(`crops.${crop}`)}
                                                </Typography>
                                                <Typography variant="body2" fontWeight={700} color="primary.main">
                                                    {volume.toLocaleString('en-IN')} {t('analytics.qtlDay')}
                                                </Typography>
                                            </Box>
                                            <LinearProgress variant="determinate" value={(volume / maxVol) * 100}
                                                sx={{ height: 8, borderRadius: 4, bgcolor: 'action.hover', '& .MuiLinearProgress-bar': { bgcolor: '#2E7D32', borderRadius: 4 } }} />
                                        </Box>
                                    );
                                })}
                            </CardContent>
                        </Card>
                    )}

                    {/* Handling Rate */}
                    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'success.light', borderRadius: 3, bgcolor: 'success.lighter' }}>
                        <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
                            <AttachMoney sx={{ color: 'success.dark', fontSize: 40 }} />
                            <Box>
                                <Typography variant="h6" fontWeight={800} color="success.dark">
                                    {t('analytics.handlingRateInfo', { rate: analytics.handlingRate })}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">{t('analytics.handlingRateDetail')}</Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>
            )}

            {/* ═══════════════════════════════════════════════════════
                TAB 3 — PRICE GUIDE
            ═══════════════════════════════════════════════════════ */}
            {activeSection === 'suggestions' && (
                <Box>
                    <Box display="flex" alignItems="center" gap={1.5} mb={3}>
                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'warning.lighter', display: 'flex' }}>
                            <Lightbulb sx={{ color: 'warning.dark' }} />
                        </Box>
                        <Box>
                            <Typography variant="h6" fontWeight={800}>{t('analytics.priceGuidance')}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                {t('analytics.comparedAgainst', {
                                    count: analytics.stateMandisCount || 0,
                                    state: analytics.location?.state || ''
                                })}
                            </Typography>
                        </Box>
                    </Box>

                    {(analytics.priceSuggestions || []).length === 0 ? (
                        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'success.light', borderRadius: 3, p: 3, textAlign: 'center' }}>
                            <CheckCircle sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                            <Typography variant="h6" fontWeight={700} color="success.main">{t('analytics.allCompetitive')}</Typography>
                            <Typography variant="body2" color="text.secondary">{t('analytics.allCompetitiveDesc')}</Typography>
                        </Card>
                    ) : (
                        <Box display="flex" flexDirection="column" gap={2}>
                            {(analytics.priceSuggestions || []).map(({ crop, myPrice, stateAvg, diff, diffPct, action }) => (
                                <Card key={crop} elevation={0} sx={{
                                    border: '1px solid',
                                    borderColor: action === 'raise' ? 'warning.light' : 'success.light',
                                    borderRadius: 3, overflow: 'hidden'
                                }}>
                                    <Box sx={{
                                        height: 4,
                                        background: action === 'raise'
                                            ? 'linear-gradient(90deg,#F57F17,#FBC02D)'
                                            : 'linear-gradient(90deg,#1B5E20,#4CAF50)'
                                    }} />
                                    <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                                        <Box sx={{ fontSize: '1.8rem' }}>{CROP_EMOJI[crop] || '🌱'}</Box>
                                        <Box flex={1} minWidth={150}>
                                            <Typography variant="body1" fontWeight={800}>{t(`crops.${crop}`)}</Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {t('analytics.stateAvg')}: ₹{stateAvg?.toLocaleString('en-IN')}/qtl
                                            </Typography>
                                        </Box>
                                        <Box textAlign="center" minWidth={90}>
                                            <Typography variant="caption" color="text.secondary">{t('analytics.yourPrice')}</Typography>
                                            <Typography variant="h6" fontWeight={900}
                                                color={action === 'competitive' ? 'success.main' : 'warning.dark'}>
                                                ₹{myPrice?.toLocaleString('en-IN')}
                                            </Typography>
                                        </Box>
                                        <Chip
                                            icon={action === 'raise'
                                                ? <WarningAmber sx={{ fontSize: '14px !important' }} />
                                                : <CheckCircle sx={{ fontSize: '14px !important' }} />}
                                            label={`${diff > 0 ? '+' : ''}${diffPct}% ${t('analytics.vsState')}`}
                                            size="small"
                                            sx={{
                                                bgcolor: action === 'raise' ? 'warning.lighter' : 'success.lighter',
                                                color: action === 'raise' ? 'warning.dark' : 'success.dark',
                                                fontWeight: 800, border: '1px solid',
                                                borderColor: action === 'raise' ? 'warning.light' : 'success.light'
                                            }}
                                        />
                                        <Box sx={{
                                            px: 2, py: 0.75, borderRadius: 2, minWidth: 220,
                                            bgcolor: action === 'raise' ? 'warning.lighter' : 'success.lighter'
                                        }}>
                                            <Typography variant="caption" fontWeight={700}
                                                color={action === 'raise' ? 'warning.dark' : 'success.dark'}>
                                                {action === 'raise'
                                                    ? t('analytics.raiseSuggestion', { amount: Math.abs(diff) })
                                                    : t('analytics.competitiveSuggestion', { amount: Math.abs(diff) })}
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </Card>
                            ))}
                        </Box>
                    )}
                </Box>
            )}

            {/* ═══════════════════════════════════════════════════════
                TAB 4 — TRENDS
            ═══════════════════════════════════════════════════════ */}
            {activeSection === 'trends' && (
                <Box>
                    {trendEntries.length === 0 ? (
                        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 5, textAlign: 'center' }}>
                            <ShowChart sx={{ fontSize: 56, color: 'text.secondary', opacity: 0.3, mb: 2 }} />
                            <Typography variant="h6" color="text.secondary">{t('analytics.noPriceHistory')}</Typography>
                            <Typography variant="body2" color="text.secondary" mt={1}>{t('analytics.noPriceHistoryDesc')}</Typography>
                        </Card>
                    ) : (
                        <Box>
                            <Box display="flex" gap={1.5} flexWrap="wrap" mb={2}>
                                <Chip icon={<TrendingUp />} label={`${risingCrops} ${t('analytics.rising')}`} color="success" variant="outlined" />
                                <Chip icon={<TrendingDown />} label={`${fallingCrops} ${t('analytics.falling')}`} color="error" variant="outlined" />
                                <Chip icon={<TrendingFlat />} label={`${trendEntries.length - risingCrops - fallingCrops} ${t('analytics.stable')}`} color="warning" variant="outlined" />
                            </Box>
                            <Box display="flex" flexDirection="column" gap={2}>
                                {trendEntries.map(([crop, trend]) => (
                                    <Card key={crop} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                                        <CardContent sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Box sx={{ fontSize: '1.5rem' }}>{CROP_EMOJI[crop] || '🌱'}</Box>
                                            <Box flex={1}>
                                                <Typography variant="body2" fontWeight={800}>{t(`crops.${crop}`)}</Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    ₹{trend.previous?.toLocaleString('en-IN')} → ₹{trend.current?.toLocaleString('en-IN')}
                                                </Typography>
                                            </Box>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <TrendArrow direction={trend.direction} />
                                                <Typography variant="body1" fontWeight={800}
                                                    color={trend.direction === 'up' ? 'success.main' : trend.direction === 'down' ? 'error.main' : 'warning.main'}>
                                                    {trend.direction === 'up' ? '+' : ''}{trend.changePct}%
                                                </Typography>
                                            </Box>
                                            <Chip
                                                label={trend.direction === 'up' ? t('analytics.rising') : trend.direction === 'down' ? t('analytics.falling') : t('analytics.stable')}
                                                size="small"
                                                color={trend.direction === 'up' ? 'success' : trend.direction === 'down' ? 'error' : 'warning'}
                                                sx={{ fontWeight: 700, minWidth: 64 }}
                                            />
                                        </CardContent>
                                    </Card>
                                ))}
                            </Box>
                        </Box>
                    )}
                </Box>
            )}
        </Container>
    );
};

export default MandiAnalyticsPage;
