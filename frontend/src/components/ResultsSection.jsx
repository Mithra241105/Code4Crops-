import React from 'react';
import { Container, Grid, Alert, Typography, Box, Fade, Grow } from '@mui/material';
// Icons removed
import MandiCard from './MandiCard';
import ProfitCharts from './ProfitCharts';
import MandiMap from './MandiMap';

const ResultsSection = ({ mandis, farmerLocation }) => {
    if (!mandis || mandis.length === 0) {
        return null;
    }

    const topMandi = mandis[0];
    const nearestMandi = mandis.reduce((nearest, current) =>
        current.distance < nearest.distance ? current : nearest
        , mandis[0]);

    const profitDifference = nearestMandi.name !== topMandi.name
        ? topMandi.netProfit - nearestMandi.netProfit
        : 0;

    return (
        <Container maxWidth="xl" sx={{ px: 3, py: 6 }}>
            {/* Profit Difference Alert */}
            {profitDifference > 0 && (
                <Fade in timeout={800}>
                    <Alert
                        severity="success"
                        icon={<span style={{ fontSize: 32 }}>💰</span>}
                        sx={{
                            mb: 4,
                            py: 3,
                            px: 4,
                            fontSize: '1.1rem',
                            background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
                            border: '2px solid #2E7D32',
                            borderRadius: 3,
                            boxShadow: '0 8px 24px rgba(46, 125, 50, 0.2)',
                            '& .MuiAlert-message': {
                                width: '100%',
                            },
                        }}
                    >
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: '#1B5E20', display: 'flex', alignItems: 'center', gap: 1 }}>
                                <span style={{ fontSize: 24 }}>📈</span> Smart Choice Bonus!
                            </Typography>
                            <Typography variant="h6" sx={{ color: '#2E7D32' }}>
                                You can earn <strong style={{ fontSize: '1.8rem', color: '#1B5E20' }}>₹{profitDifference.toFixed(2)}</strong> more
                                by choosing <strong>{topMandi.name}</strong> instead of the nearest mandi ({nearestMandi.name})
                            </Typography>
                        </Box>
                    </Alert>
                </Fade>
            )}

            {/* Results Header */}
            <Fade in timeout={600}>
                <Box textAlign="center" mb={5}>
                    <Typography variant="h3" color="primary" gutterBottom sx={{ fontWeight: 700 }}>
                        🎯 Optimization Results
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                        Ranked by net profit • {mandis.length} mandis analyzed
                    </Typography>
                </Box>
            </Fade>

            {/* Mandi Cards Grid */}
            <Grid container spacing={3} sx={{ mb: 6 }}>
                {mandis.map((mandi, index) => (
                    <Grid item xs={12} md={6} lg={4} key={mandi.id}>
                        <Grow in timeout={(index + 1) * 150}>
                            <div>
                                <MandiCard
                                    mandi={mandi}
                                    index={index}
                                    isTop={index === 0}
                                />
                            </div>
                        </Grow>
                    </Grid>
                ))}
            </Grid>

            {/* Charts and Map Section */}
            <Grid container spacing={4}>
                <Grid item xs={12} lg={6}>
                    <Grow in timeout={1200}>
                        <div>
                            <ProfitCharts mandis={mandis} />
                        </div>
                    </Grow>
                </Grid>
                <Grid item xs={12} lg={6}>
                    <Grow in timeout={1400}>
                        <div>
                            <MandiMap mandis={mandis} farmerLocation={farmerLocation} />
                        </div>
                    </Grow>
                </Grid>
            </Grid>
        </Container>
    );
};

export default ResultsSection;
