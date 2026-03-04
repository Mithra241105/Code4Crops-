import React, { useMemo } from 'react';
import {
    Box, Card, CardContent, Typography, Chip, Tooltip,
    LinearProgress, Divider, useTheme
} from '@mui/material';
import {
    TrendingUp, TrendingDown, TrendingFlat,
    Bolt, InfoOutlined, CheckCircle
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useUnit } from '../../contexts/UnitContext';

// ─── Simulation engine ─────────────────────────────────────────────
const HOUR = new Date().getHours();
const DOW = new Date().getDay();

function computeRadar(mandiResult, cropType, isDarkMode) {
    const { demandScore = 70, distance = 50, cropPrice = 2000 } = mandiResult;
    const demand = Math.min(100, Math.max(0, demandScore + (HOUR >= 6 && HOUR <= 10 ? 10 : 0)));
    const demandKey = demand >= 75 ? 'high' : demand >= 45 ? 'medium' : 'low';

    // Theme-aware colors
    const demandColor = demand >= 75 ? '#4ADE80' : demand >= 45 ? '#FBBF24' : '#F87171';

    const cropHash = [...cropType].reduce((a, c) => a + c.charCodeAt(0), 0);
    const trendRaw = (demand + DOW * 5 + (cropHash % 20)) % 100;
    const trendKey = trendRaw >= 60 ? 'rising' : trendRaw >= 35 ? 'stable' : 'falling';

    const trendColor = trendKey === 'rising' ? '#4ADE80' : trendKey === 'stable' ? '#60A5FA' : '#F87171';

    const pressure = Math.min(100, Math.max(0, 100 - demand + (distance > 80 ? -20 : 10)));
    const pressureKey = pressure >= 70 ? 'high' : pressure >= 40 ? 'medium' : 'low';
    const pressureColor = pressure >= 70 ? '#F87171' : pressure >= 40 ? '#FBBF24' : '#4ADE80';

    let actionKey, actionColor, actionBg, reasonKey;
    if (trendKey === 'rising' && demand >= 60) {
        actionKey = 'sellToday';
        actionColor = isDarkMode ? '#4ADE80' : '#1B5E20';
        actionBg = isDarkMode ? 'rgba(74, 222, 128, 0.1)' : '#E8F5E9';
        reasonKey = 'reasonSellRising';
    } else if (trendKey === 'falling' || demand < 40) {
        actionKey = 'wait';
        actionColor = isDarkMode ? '#F87171' : '#BF360C';
        actionBg = isDarkMode ? 'rgba(248, 113, 113, 0.1)' : '#FBE9E7';
        reasonKey = 'reasonWait';
    } else if (demand >= 50 && distance < 40) {
        actionKey = 'sellToday';
        actionColor = isDarkMode ? '#4ADE80' : '#1B5E20';
        actionBg = isDarkMode ? 'rgba(74, 222, 128, 0.1)' : '#E8F5E9';
        reasonKey = 'reasonSellClose';
    } else {
        actionKey = 'otherMandis';
        actionColor = isDarkMode ? '#A78BFA' : '#4A148C';
        actionBg = isDarkMode ? 'rgba(167, 139, 250, 0.1)' : '#F3E5F5';
        reasonKey = 'reasonOther';
    }

    return { demand, demandKey, demandColor, trendKey, trendColor, pressure, pressureKey, pressureColor, actionKey, actionColor, actionBg, reasonKey };
}

// ─── Sub-components ────────────────────────────────────────────────

const TrendIcon = ({ trendKey, color }) => {
    const sx = { fontSize: 20, color };
    if (trendKey === 'rising') return <TrendingUp sx={sx} />;
    if (trendKey === 'falling') return <TrendingDown sx={sx} />;
    return <TrendingFlat sx={sx} />;
};

const RadarBar = ({ label, value, color, badge }) => (
    <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
            <Typography variant="caption" fontWeight={700} color="text.secondary">{label}</Typography>
            <Chip label={badge} size="small"
                sx={{ bgcolor: `${color}22`, color, fontWeight: 800, fontSize: '0.65rem', height: 18 }} />
        </Box>
        <LinearProgress variant="determinate" value={value}
            sx={{
                height: 6, borderRadius: 3, bgcolor: 'action.hover',
                '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 3 }
            }} />
    </Box>
);

// ─── Main Component ────────────────────────────────────────────────

const DemandRadar = ({ results, cropType }) => {
    const { t } = useTranslation();
    const { fmtPrice } = useUnit();
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === 'dark';

    const best = results[0];
    const radar = useMemo(() => computeRadar(best, cropType, isDarkMode), [best, cropType, isDarkMode]);

    if (!best) return null;

    const reason = t(`demand.${radar.reasonKey}`, {
        demand: t(`demand.${radar.demandKey}`).toLowerCase(),
        pressure: t(`demand.${radar.pressureKey}`).toLowerCase(),
    });

    return (
        <Card elevation={0} sx={{
            border: '1px solid',
            borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(46,125,50,0.2)',
            borderRadius: 3, mb: 3, overflow: 'hidden',
            bgcolor: 'background.paper',
            boxShadow: theme.shadows[2]
        }}>
            {/* Header */}
            <Box sx={{
                background: isDarkMode
                    ? 'linear-gradient(135deg, #064E3B 0%, #065F46 100%)'
                    : 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)',
                px: 2.5, py: 1.5,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
                <Box display="flex" alignItems="center" gap={1}>
                    <Bolt sx={{ color: '#FBBF24', fontSize: 22 }} />
                    <Typography variant="h6" fontWeight={800} color="white" fontSize="0.9rem">
                        {t('demand.marketRadar')}
                    </Typography>
                </Box>
                <Chip label={best.mandiName} size="small"
                    sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'white', fontWeight: 700, fontSize: '0.7rem' }} />
            </Box>

            <CardContent sx={{ p: 2.5 }}>
                <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1.1fr' }} gap={4}>
                    {/* Left: gauges */}
                    <Box display="flex" flexDirection="column" gap={2.5}>
                        <RadarBar label={t('demand.marketDemand')} value={radar.demand}
                            color={radar.demandColor} badge={t(`demand.${radar.demandKey}`)} />
                        <RadarBar label={t('demand.arrivalPressure')} value={radar.pressure}
                            color={radar.pressureColor} badge={t(`demand.${radar.pressureKey}`)} />

                        <Box display="flex" alignItems="center" gap={1.5} sx={{ mt: 0.5 }}>
                            <Typography variant="caption" fontWeight={700} color="text.secondary">
                                {t('demand.priceTrend')}
                            </Typography>
                            <Box display="flex" alignItems="center" gap={0.5}>
                                <TrendIcon trendKey={radar.trendKey} color={radar.trendColor} />
                                <Typography variant="caption" fontWeight={800} sx={{ color: radar.trendColor, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                    {t(`demand.${radar.trendKey}`)}
                                </Typography>
                            </Box>
                        </Box>

                        <Box sx={{ mt: 'auto' }}>
                            <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" sx={{ mb: -0.5 }}>
                                {t('demand.bestPrice')}
                            </Typography>
                            <Typography variant="h4" fontWeight={900} color="primary.main">
                                {fmtPrice(best.cropPrice)}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Right: recommendation */}
                    <Box>
                        <Box sx={{
                            bgcolor: radar.actionBg,
                            borderRadius: 3,
                            p: 2.5,
                            border: '1px solid',
                            borderColor: `${radar.actionColor}33`,
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            {/* Decorative background element */}
                            <Box sx={{
                                position: 'absolute', top: -20, right: -20, width: 80, height: 80,
                                bgcolor: `${radar.actionColor}11`, borderRadius: '50%', zIndex: 0
                            }} />

                            <Box sx={{ position: 'relative', zIndex: 1 }}>
                                <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                                    <CheckCircle sx={{ color: radar.actionColor, fontSize: 18 }} />
                                    <Typography variant="caption" fontWeight={800} sx={{ color: radar.actionColor, letterSpacing: 1.5, textTransform: 'uppercase' }}>
                                        {t('demand.recommendation')}
                                    </Typography>
                                </Box>
                                <Typography variant="h4" fontWeight={900} sx={{ color: radar.actionColor, mb: 2, lineHeight: 1.1, letterSpacing: -0.5 }}>
                                    {t(`demand.${radar.actionKey}`).toUpperCase()}
                                </Typography>
                                <Divider sx={{ mb: 2, borderColor: `${radar.actionColor}22` }} />
                                <Box display="flex" alignItems="flex-start" gap={1}>
                                    <InfoOutlined sx={{ fontSize: 16, color: radar.actionColor, mt: 0.2, opacity: 0.8 }} />
                                    <Typography variant="body2" sx={{ color: isDarkMode ? 'text.secondary' : 'text.primary', lineHeight: 1.6, fontWeight: 500 }}>
                                        {reason}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>

                        {results.length > 1 && (
                            <Box mt={2.5}>
                                <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                                    {t('demand.alternatives')}
                                </Typography>
                                <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                                    {results.slice(1, 4).map((m, i) => {
                                        const r = computeRadar(m, cropType, isDarkMode);
                                        return (
                                            <Tooltip key={m.mandiId || i} arrow
                                                title={`${m.mandiName}: ${t(`demand.${r.demandKey}`)} · ${t(`demand.${r.trendKey}`)}`}>
                                                <Chip
                                                    label={`${m.mandiName?.split(' ')[0]} • ${fmtPrice(m.cropPrice)}`}
                                                    size="small"
                                                    sx={{
                                                        cursor: 'default',
                                                        fontWeight: 700,
                                                        fontSize: '0.72rem',
                                                        px: 0.5,
                                                        bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                                                        color: r.trendColor,
                                                        border: '1px solid',
                                                        borderColor: 'divider',
                                                        '&:hover': { bgcolor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' }
                                                    }}
                                                />
                                            </Tooltip>
                                        );
                                    })}
                                </Box>
                            </Box>
                        )}
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};

export default DemandRadar;
