import React, { useState } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Chip,
    Grid,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Divider,
    LinearProgress,
} from '@mui/material';
// Icons removed
import { getRankBadge, getRiskColor, formatCurrency } from '../utils/calculations';

const MandiCard = ({ mandi, index, isTop }) => {
    const [expanded, setExpanded] = useState(false);
    const rankBadge = getRankBadge(mandi.rank);
    const riskColor = getRiskColor(mandi.riskLevel);

    return (
        <Card
            elevation={isTop ? 12 : 3}
            sx={{
                position: 'relative',
                height: '100%',
                border: isTop ? '4px solid #2E7D32' : '2px solid #E0E0E0',
                bgcolor: isTop ? '#E8F5E9' : 'white',
                borderRadius: 3,
                pt: 3,
                overflow: 'visible',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                animation: isTop ? 'pulse 2s infinite' : 'none',
                '@keyframes pulse': {
                    '0%, 100%': {
                        boxShadow: isTop ? '0 0 20px rgba(46, 125, 50, 0.4), 0 8px 24px rgba(0,0,0,0.12)' : '0 4px 12px rgba(0,0,0,0.08)',
                    },
                    '50%': {
                        boxShadow: isTop ? '0 0 40px rgba(46, 125, 50, 0.6), 0 12px 32px rgba(0,0,0,0.15)' : '0 4px 12px rgba(0,0,0,0.08)',
                    },
                },
                '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)',
                    boxShadow: isTop
                        ? '0 0 50px rgba(46, 125, 50, 0.7), 0 20px 40px rgba(0,0,0,0.2)'
                        : '0 12px 28px rgba(0,0,0,0.18)',
                },
            }}
        >
            {/* Rank Badge - Fully Visible */}
            <Box
                sx={{
                    position: 'absolute',
                    top: -18,
                    right: 20,
                    zIndex: 10,
                }}
            >
                <Chip
                    icon={mandi.rank <= 3 ? <span>🏆</span> : undefined}
                    label={rankBadge.emoji}
                    sx={{
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        bgcolor: rankBadge.color,
                        color: 'white',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                        px: 2,
                        py: 2.5,
                        height: 'auto',
                        '& .MuiChip-label': {
                            px: 1,
                        },
                    }}
                />
            </Box>

            <CardContent sx={{ p: 3, pt: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box flex={1}>
                        <Typography variant="h5" color="primary" sx={{ fontWeight: 700, mb: 0.5 }}>
                            {mandi.name}
                        </Typography>
                        <Box display="flex" gap={1} flexWrap="wrap">
                            <Chip
                                label={`Rank ${mandi.rank}`}
                                size="small"
                                color={isTop ? 'success' : 'default'}
                                sx={{ fontWeight: 600 }}
                            />
                            <Chip
                                icon={<span>⚠️</span>}
                                label={`${mandi.riskLevel} Risk`}
                                size="small"
                                color={riskColor}
                            />
                        </Box>
                    </Box>
                    <Box textAlign="right">
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            Distance
                        </Typography>
                        <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
                            {mandi.distance} km
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={0.5} justifyContent="flex-end">
                            ⏱️ {mandi.travelTime}
                        </Typography>
                    </Box>
                </Box>

                {/* Profit Margin Progress */}
                <Box mb={2}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            Profit Margin
                        </Typography>
                        <Typography variant="caption" color="success.main" sx={{ fontWeight: 700 }}>
                            {mandi.profitMargin}%
                        </Typography>
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={Math.min(parseFloat(mandi.profitMargin), 100)}
                        sx={{
                            height: 8,
                            borderRadius: 4,
                            bgcolor: '#E0E0E0',
                            '& .MuiLinearProgress-bar': {
                                bgcolor: isTop ? '#2E7D32' : '#66BB6A',
                                borderRadius: 4,
                            },
                        }}
                    />
                </Box>

                <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                        <Box sx={{ bgcolor: isTop ? '#C8E6C9' : '#F5F5F5', p: 2, borderRadius: 2 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                💵 Market Price
                            </Typography>
                            <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
                                ₹{mandi.price}/kg
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={6}>
                        <Box sx={{ bgcolor: isTop ? '#C8E6C9' : '#F5F5F5', p: 2, borderRadius: 2 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                📈 Revenue
                            </Typography>
                            <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
                                {formatCurrency(mandi.revenue)}
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>

                {/* Expandable Cost Breakdown */}
                <Accordion
                    expanded={expanded}
                    onChange={() => setExpanded(!expanded)}
                    sx={{
                        boxShadow: 'none',
                        '&:before': { display: 'none' },
                        bgcolor: 'transparent',
                        borderRadius: 2,
                    }}
                >
                    <AccordionSummary
                        expandIcon={<span>▼</span>}
                        sx={{
                            minHeight: 48,
                            '&.Mui-expanded': {
                                minHeight: 48,
                            },
                        }}
                    >
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            Cost Breakdown
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Box>
                            <Box display="flex" justifyContent="space-between" mb={1}>
                                <Typography variant="body2" color="text.secondary" display="flex" alignItems="center" gap={0.5}>
                                    🚚 Transport Cost
                                </Typography>
                                <Typography variant="body2" color="error" sx={{ fontWeight: 600 }}>
                                    -{formatCurrency(mandi.transportCost)}
                                </Typography>
                            </Box>
                            <Divider sx={{ my: 1 }} />
                            <Box display="flex" justifyContent="space-between" mb={1}>
                                <Typography variant="body2" color="text.secondary">
                                    Handling Cost
                                </Typography>
                                <Typography variant="body2" color="error" sx={{ fontWeight: 600 }}>
                                    -{formatCurrency(mandi.handlingCost)}
                                </Typography>
                            </Box>
                            <Divider sx={{ my: 1 }} />
                            <Box display="flex" justifyContent="space-between">
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                    Total Costs
                                </Typography>
                                <Typography variant="body2" color="error" sx={{ fontWeight: 700 }}>
                                    -{formatCurrency(mandi.transportCost + mandi.handlingCost)}
                                </Typography>
                            </Box>
                        </Box>
                    </AccordionDetails>
                </Accordion>

                {/* Net Profit */}
                <Box
                    sx={{
                        bgcolor: isTop ? '#2E7D32' : '#4CAF50',
                        color: 'white',
                        p: 2.5,
                        borderRadius: 2,
                        border: isTop ? '2px solid #1B5E20' : 'none',
                        mt: 2,
                        textAlign: 'center',
                    }}
                >
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, opacity: 0.9 }}>
                        Net Profit
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {formatCurrency(mandi.netProfit)}
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
};

export default MandiCard;
