import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const ProfitChart = ({ mandis }) => {
    const chartData = mandis.map((mandi, index) => ({
        name: mandi.name,
        profit: parseFloat(mandi.netProfit.toFixed(2)),
        isTop: index === 0,
    }));

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <Card elevation={3}>
                    <CardContent>
                        <Typography variant="subtitle1" color="primary" sx={{ fontWeight: 700 }}>
                            {payload[0].payload.name}
                        </Typography>
                        <Typography variant="h6" color="success.main" sx={{ fontWeight: 600 }}>
                            ₹{payload[0].value.toFixed(2)}
                        </Typography>
                    </CardContent>
                </Card>
            );
        }
        return null;
    };

    return (
        <Card elevation={3}>
            <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" color="primary" gutterBottom align="center" sx={{ mb: 3, fontWeight: 600 }}>
                    Profit Comparison
                </Typography>
                <Box sx={{ width: '100%', height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis
                                dataKey="name"
                                angle={-45}
                                textAnchor="end"
                                height={100}
                                tick={{ fill: '#666', fontSize: 12 }}
                            />
                            <YAxis
                                tick={{ fill: '#666', fontSize: 12 }}
                                label={{ value: 'Net Profit (₹)', angle: -90, position: 'insideLeft', style: { fill: '#666' } }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                wrapperStyle={{ paddingTop: '20px' }}
                                formatter={() => 'Net Profit'}
                            />
                            <Bar dataKey="profit" radius={[8, 8, 0, 0]}>
                                {chartData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.isTop ? '#2E7D32' : '#81C784'}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </Box>
            </CardContent>
        </Card>
    );
};

export default ProfitChart;
