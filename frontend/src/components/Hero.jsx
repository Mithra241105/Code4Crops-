import React from 'react';
import { Box, Typography, Paper, Container, Grid } from '@mui/material';
// Icons removed

const Hero = () => {
    return (
        <Box
            sx={{
                position: 'relative',
                background: 'linear-gradient(rgba(27, 94, 32, 0.8), rgba(27, 94, 32, 0.9)), url("/farm.jpg")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
                color: 'white',
                py: 12,
                px: 3,
                overflow: 'hidden',
            }}
        >
            <Container maxWidth="lg">
                <Box textAlign="center">
                    <Box mb={3}>
                        <Typography
                            variant="caption"
                            sx={{
                                display: 'inline-block',
                                bgcolor: 'rgba(255,255,255,0.2)',
                                px: 3,
                                py: 1,
                                borderRadius: 50,
                                fontWeight: 600,
                                letterSpacing: 1,
                                textTransform: 'uppercase',
                                border: '1px solid rgba(255,255,255,0.3)',
                            }}
                        >
                            Smart Agriculture Technology
                        </Typography>
                    </Box>

                    <Typography variant="h1" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
                        Krishi-Route
                    </Typography>

                    <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: '#C8E6C9', mb: 2 }}>
                        Optimize Profit, Not Just Distance
                    </Typography>

                    <Typography variant="h6" sx={{ maxWidth: 800, mx: 'auto', color: '#E8F5E9', lineHeight: 1.6 }}>
                        Maximize your agricultural profits with intelligent logistics optimization.
                        Find the best mandi based on price, transport costs, and net profit—not just proximity.
                    </Typography>

                    <Grid container spacing={3} justifyContent="center" sx={{ mt: 6 }}>
                        <Grid item xs={12} sm={4}>
                            <Paper
                                elevation={0}
                                sx={{
                                    bgcolor: 'rgba(255,255,255,0.15)',
                                    backdropFilter: 'blur(10px)',
                                    p: 3,
                                    border: '1px solid rgba(255,255,255,0.2)',
                                }}
                            >
                                <span style={{ fontSize: 40, marginBottom: 8 }}>📈</span>
                                <Typography variant="body2" sx={{ color: '#C8E6C9', mb: 1 }}>
                                    Real-time Pricing
                                </Typography>
                                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                    ₹ Live Data
                                </Typography>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} sm={4}>
                            <Paper
                                elevation={0}
                                sx={{
                                    bgcolor: 'rgba(255,255,255,0.15)',
                                    backdropFilter: 'blur(10px)',
                                    p: 3,
                                    border: '1px solid rgba(255,255,255,0.2)',
                                }}
                            >
                                <span style={{ fontSize: 40, marginBottom: 8 }}>🚚</span>
                                <Typography variant="body2" sx={{ color: '#C8E6C9', mb: 1 }}>
                                    Smart Routing
                                </Typography>
                                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                    AI Powered
                                </Typography>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} sm={4}>
                            <Paper
                                elevation={0}
                                sx={{
                                    bgcolor: 'rgba(255,255,255,0.15)',
                                    backdropFilter: 'blur(10px)',
                                    p: 3,
                                    border: '1px solid rgba(255,255,255,0.2)',
                                }}
                            >
                                <span style={{ fontSize: 40, marginBottom: 8 }}>📊</span>
                                <Typography variant="body2" sx={{ color: '#C8E6C9', mb: 1 }}>
                                    Cost Analysis
                                </Typography>
                                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                    Complete
                                </Typography>
                            </Paper>
                        </Grid>
                    </Grid>
                </Box>
            </Container>
        </Box>
    );
};

export default Hero;
