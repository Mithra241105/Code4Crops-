import React, { useMemo } from 'react';
import {
    Box, Card, CardContent, Typography, Chip, Tooltip,
    LinearProgress, Divider
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

function computeRadar(mandiResult, cropType) {
    const { demandScore = 70, distance = 50, cropPrice = 2000 } = mandiResult;
    const demand = Math.min(100, Math.max(0, demandScore + (HOUR >= 6 && HOUR <= 10 ? 10 : 0)));
    const demandKey = demand >= 75 ? 'high' : demand >= 45 ? 'medium' : 'low';
    const demandColor = demand >= 75 ? '#2E7D32' : demand >= 45 ? '#F57F17' : '#C62828';

    const cropHash = [...cropType].reduce((a, c) => a + c.charCodeAt(0), 0);
    const trendRaw = (demand + DOW * 5 + (cropHash % 20)) % 100;
    const trendKey = trendRaw >= 60 ? 'rising' : trendRaw >= 35 ? 'stable' : 'falling';
    const trendColor = trendKey === 'rising' ? '#2E7D32' : trendKey === 'stable' ? '#1565C0' : '#C62828';

    const pressure = Math.min(100, Math.max(0, 100 - demand + (distance > 80 ? -20 : 10)));
    const pressureKey = pressure >= 70 ? 'high' : pressure >= 40 ? 'medium' : 'low';
    const pressureColor = pressure >= 70 ? '#C62828' : pressure >= 40 ? '#F57F17' : '#2E7D32';

    let actionKey, actionColor, actionBg, reasonKey;
    if (trendKey === 'rising' && demand >= 60) {
        actionKey = 'sellToday'; actionColor = '#1B5E20'; actionBg = '#E8F5E9'; reasonKey = 'reasonSellRising';
    } else if (trendKey === 'falling' || demand < 40) {
        actionKey = 'wait'; actionColor = '#BF360C'; actionBg = '#FBE9E7'; reasonKey = 'reasonWait';
    } else if (demand >= 50 && distance < 40) {
        actionKey = 'sellToday'; actionColor = '#1B5E20'; actionBg = '#E8F5E9'; reasonKey = 'reasonSellClose';
    } else {
        actionKey = 'otherMandis'; actionColor = '#4A148C'; actionBg = '#F3E5F5'; reasonKey = 'reasonOther';
    }

    return { demand, demandKey, demandColor, trendKey, trendColor, pressure, pressureKey, pressureColor, actionKey, actionColor, actionBg, reasonKey };
}

// ─── Sub-components ────────────────────────────────────────────────

const TrendIcon = ({ trendKey }) => {
    const sx = { fontSize: 20 };
    if (trendKey === 'rising') return <TrendingUp sx={{ ...sx, color: '#2E7D32' }} />;
    if (trendKey === 'falling') return <TrendingDown sx={{ ...sx, color: '#C62828' }} />;
    return <TrendingFlat sx={{ ...sx, color: '#1565C0' }} />;
};

const RadarBar = ({ label, value, color, badge }) => (
    <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
            <Typography variant="caption" fontWeight={600} color="text.secondary">{label}</Typography>
            <Chip label={badge} size="small"
                sx={{ bgcolor: color + '18', color, fontWeight: 700, fontSize: '0.7rem', height: 20 }} />
        </Box>
        <LinearProgress variant="determinate" value={value}
            sx={{
                height: 6, borderRadius: 3, bgcolor: '#F5F5F5',
                '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 3 }
            }} />
    </Box>
);

// ─── Main Component ────────────────────────────────────────────────

const DemandRadar = ({ results, cropType }) => {
    const { t } = useTranslation();
    const { fmtPrice } = useUnit();
    const best = results[0];
    const radar = useMemo(() => computeRadar(best, cropType), [best, cropType]);

    if (!best) return null;

    const reason = t(`demand.${radar.reasonKey}`, {
        demand: t(`demand.${radar.demandKey}`).toLowerCase(),
        pressure: t(`demand.${radar.pressureKey}`).toLowerCase(),
    });

    return (
        <Card elevation={0} sx={{ border: '1.5px solid rgba(46,125,50,0.2)', borderRadius: 3, mb: 3, overflow: 'hidden' }}>
            {/* Header */}
            <Box sx={{
                background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)', px: 2.5, py: 2,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
                <Box display="flex" alignItems="center" gap={1}>
                    <Bolt sx={{ color: '#FFD54F', fontSize: 22 }} />
                    <Typography variant="h6" fontWeight={800} color="white" fontSize="1rem">
                        {t('demand.title')}
                    </Typography>
                </Box>
                <Chip label={best.mandiName} size="small"
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 700, fontSize: '0.72rem' }} />
            </Box>

            <CardContent sx={{ p: 2.5 }}>
                <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={3}>
                    {/* Left: gauges */}
                    <Box display="flex" flexDirection="column" gap={2}>
                        <RadarBar label={t('demand.marketDemand')} value={radar.demand}
                            color={radar.demandColor} badge={t(`demand.${radar.demandKey}`)} />
                        <RadarBar label={t('demand.arrivalPressure')} value={radar.pressure}
                            color={radar.pressureColor} badge={t(`demand.${radar.pressureKey}`)} />

                        <Box display="flex" alignItems="center" gap={1.5}>
                            <Typography variant="caption" fontWeight={600} color="text.secondary">
                                {t('demand.priceTrend')}
                            </Typography>
                            <Box display="flex" alignItems="center" gap={0.5}>
                                <TrendIcon trendKey={radar.trendKey} />
                                <Typography variant="caption" fontWeight={700} color={radar.trendColor}>
                                    {t(`demand.${radar.trendKey}`)}
                                </Typography>
                            </Box>
                        </Box>

                        <Box>
                            <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                {t('demand.bestPrice')}
                            </Typography>
                            <Typography variant="h5" fontWeight={800} color="primary.main">
                                {fmtPrice(best.cropPrice)}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Right: recommendation */}
                    <Box>
                        <Box sx={{
                            bgcolor: radar.actionBg, borderRadius: 2, p: 2,
                            border: `1.5px solid ${radar.actionColor}22`
                        }}>
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                                <CheckCircle sx={{ color: radar.actionColor, fontSize: 20 }} />
                                <Typography variant="caption" fontWeight={700} color="text.secondary" letterSpacing={1}>
                                    {t('demand.recommendation')}
                                </Typography>
                            </Box>
                            <Typography variant="h5" fontWeight={900} color={radar.actionColor} mb={1.5} lineHeight={1.2}>
                                {t(`demand.${radar.actionKey}`)}
                            </Typography>
                            <Divider sx={{ mb: 1.5 }} />
                            <Box display="flex" alignItems="flex-start" gap={0.5}>
                                <InfoOutlined sx={{ fontSize: 15, color: 'text.secondary', mt: 0.2, flexShrink: 0 }} />
                                <Typography variant="caption" color="text.secondary" lineHeight={1.5}>
                                    {reason}
                                </Typography>
                            </Box>
                        </Box>

                        {results.length > 1 && (
                            <Box mt={2}>
                                <Typography variant="caption" fontWeight={700} color="text.secondary">
                                    {t('demand.alternatives')}
                                </Typography>
                                <Box display="flex" flexWrap="wrap" gap={0.75} mt={0.75}>
                                    {results.slice(1, 4).map((m, i) => {
                                        const r = computeRadar(m, cropType);
                                        return (
                                            <Tooltip key={m.mandiId || i} arrow
                                                title={`${m.mandiName}: ${t(`demand.${r.demandKey}`)} · ${t(`demand.${r.trendKey}`)}`}>
                                                <Chip
                                                    label={`${m.mandiName?.split(' ')[0]} · ${fmtPrice(m.cropPrice)}`}
                                                    size="small"
                                                    sx={{
                                                        cursor: 'default', fontWeight: 600, fontSize: '0.68rem',
                                                        bgcolor: r.trendKey === 'rising' ? '#E8F5E9' : r.trendKey === 'falling' ? '#FFEBEE' : '#E3F2FD',
                                                        color: r.trendColor,
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
