import React, { useEffect, useState } from 'react';
import {
    Container,
    Grid,
    Card,
    CardContent,
    Typography,
    Box,
    Fade,
} from '@mui/material';
// Icons removed
import { getAnalytics } from '../services/storage';
import { formatCurrency, formatNumber } from '../utils/calculations';

const Dashboard = () => {
    const [analytics, setAnalytics] = useState(null);

    useEffect(() => {
        setAnalytics(getAnalytics());
    }, []);

    if (!analytics) return null;

    const stats = [
        {
            title: 'Total Optimizations',
            value: formatNumber(analytics.totalOptimizations),
            icon: <span style={{ fontSize: 40 }}>📊</span>,
            color: '#2E7D32',
            bgColor: '#E8F5E9',
        },
        {
            title: 'Total Profit Gained',
            value: formatCurrency(analytics.totalProfitGained),
            icon: <span style={{ fontSize: 40 }}>📈</span>,
            color: '#1976d2',
            bgColor: '#E3F2FD',
        },
        {
            title: 'Most Profitable Mandi',
            value: analytics.mostProfitableMandi || 'N/A',
            subtitle: analytics.mostProfitableMandi ? `${analytics.mostProfitableMandiCount} times` : '',
            icon: <span style={{ fontSize: 40 }}>🏆</span>,
            color: '#F57C00',
            bgColor: '#FFF3E0',
        },
        {
            title: 'Avg Transport Cost',
            value: formatCurrency(analytics.averageTransportCost),
            icon: <span style={{ fontSize: 40 }}>🚚</span>,
            color: '#D32F2F',
            bgColor: '#FFEBEE',
        },
    ];

    return (
        <Container maxWidth="xl" sx={{ py: 6 }}>
            <Box textAlign="center" mb={4}>
                <Typography variant="h3" color="primary" gutterBottom sx={{ fontWeight: 700 }}>
                    📊 Your Dashboard
                </Typography>
                <Typography variant="h6" color="text.secondary">
                    Track your optimization history and performance
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {stats.map((stat, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <Fade in timeout={(index + 1) * 200}>
                            <Card
                                elevation={4}
                                sx={{
                                    height: '100%',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-8px)',
                                        boxShadow: 8,
                                    },
                                }}
                            >
                                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                                    <Box
                                        sx={{
                                            width: 80,
                                            height: 80,
                                            borderRadius: '50%',
                                            bgcolor: stat.bgColor,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            mx: 'auto',
                                            mb: 2,
                                            color: stat.color,
                                        }}
                                    >
                                        {stat.icon}
                                    </Box>
                                    <Typography variant="h4" sx={{ fontWeight: 700, color: stat.color, mb: 1 }}>
                                        {stat.value}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                                        {stat.title}
                                    </Typography>
                                    {stat.subtitle && (
                                        <Typography variant="caption" color="text.secondary">
                                            {stat.subtitle}
                                        </Typography>
                                    )}
                                </CardContent>
                            </Card>
                        </Fade>
                    </Grid>
                ))}
            </Grid>

            {analytics.totalOptimizations === 0 && (
                <Box textAlign="center" mt={6}>
                    <Typography variant="h6" color="text.secondary">
                        No optimization history yet. Start optimizing to see your analytics!
                    </Typography>
                </Box>
            )}
        </Container>
    );
};

export default Dashboard;
