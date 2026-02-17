import React, { useState } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    ToggleButtonGroup,
    ToggleButton,
    Fade,
} from '@mui/material';
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell,
    Area,
    ComposedChart,
} from 'recharts';
// Icons removed

const ProfitCharts = ({ mandis }) => {
    const [chartType, setChartType] = useState('bar');
    const [sortBy, setSortBy] = useState('profit');

    // Sort data based on selection
    const getSortedData = () => {
        const sorted = [...mandis];
        switch (sortBy) {
            case 'distance':
                return sorted.sort((a, b) => a.distance - b.distance);
            case 'revenue':
                return sorted.sort((a, b) => b.revenue - a.revenue);
            case 'profit':
            default:
                return sorted.sort((a, b) => b.netProfit - a.netProfit);
        }
    };

    const sortedData = getSortedData();
    const topMandis = sortedData.slice(0, 10); // Show top 10 for clarity

    const chartData = topMandis.map((mandi, index) => ({
        name: mandi.name.length > 15 ? mandi.name.substring(0, 15) + '...' : mandi.name,
        profit: parseFloat(mandi.netProfit.toFixed(2)),
        revenue: parseFloat(mandi.revenue.toFixed(2)),
        transport: parseFloat(mandi.transportCost.toFixed(2)),
        handling: parseFloat(mandi.handlingCost.toFixed(2)),
        isTop: index === 0,
    }));

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <Card elevation={4}>
                    <CardContent sx={{ p: 2 }}>
                        <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 700, mb: 1 }}>
                            {payload[0].payload.name}
                        </Typography>
                        {payload.map((entry, index) => (
                            <Box key={index} display="flex" justifyContent="space-between" gap={2}>
                                <Typography variant="caption" sx={{ color: entry.color }}>
                                    {entry.name}:
                                </Typography>
                                <Typography variant="caption" sx={{ fontWeight: 700, color: entry.color }}>
                                    ₹{entry.value.toLocaleString('en-IN')}
                                </Typography>
                            </Box>
                        ))}
                    </CardContent>
                </Card>
            );
        }
        return null;
    };

    return (
        <Card elevation={4}>
            <CardContent sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
                    <Typography variant="h5" color="primary" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                        📈 Profit Analysis
                    </Typography>

                    <Box display="flex" gap={2} flexWrap="wrap">
                        {/* Chart Type Toggle */}
                        <ToggleButtonGroup
                            value={chartType}
                            exclusive
                            onChange={(e, newType) => newType && setChartType(newType)}
                            size="small"
                        >
                            <ToggleButton value="bar">
                                📊 Bar
                            </ToggleButton>
                            <ToggleButton value="line">
                                📈 Line
                            </ToggleButton>
                        </ToggleButtonGroup>

                        {/* Sort Toggle */}
                        <ToggleButtonGroup
                            value={sortBy}
                            exclusive
                            onChange={(e, newSort) => newSort && setSortBy(newSort)}
                            size="small"
                        >
                            <ToggleButton value="profit">
                                🔽 Profit
                            </ToggleButton>
                            <ToggleButton value="distance">
                                Distance
                            </ToggleButton>
                            <ToggleButton value="revenue">
                                Revenue
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </Box>
                </Box>

                <Fade in timeout={800}>
                    <Box sx={{ width: '100%', height: 400 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            {chartType === 'bar' ? (
                                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                    <XAxis
                                        dataKey="name"
                                        angle={-45}
                                        textAnchor="end"
                                        height={100}
                                        tick={{ fill: '#666', fontSize: 11 }}
                                    />
                                    <YAxis
                                        tick={{ fill: '#666', fontSize: 12 }}
                                        label={{ value: 'Amount (₹)', angle: -90, position: 'insideLeft', style: { fill: '#666' } }}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend
                                        wrapperStyle={{ paddingTop: '20px' }}
                                        iconType="circle"
                                    />
                                    <Bar dataKey="profit" name="Net Profit" radius={[8, 8, 0, 0]} animationDuration={1000}>
                                        {chartData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={entry.isTop ? '#2E7D32' : '#66BB6A'}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            ) : (
                                <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#2E7D32" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                    <XAxis
                                        dataKey="name"
                                        angle={-45}
                                        textAnchor="end"
                                        height={100}
                                        tick={{ fill: '#666', fontSize: 11 }}
                                    />
                                    <YAxis
                                        tick={{ fill: '#666', fontSize: 12 }}
                                        label={{ value: 'Amount (₹)', angle: -90, position: 'insideLeft', style: { fill: '#666' } }}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend
                                        wrapperStyle={{ paddingTop: '20px' }}
                                        iconType="circle"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        fill="url(#colorRevenue)"
                                        stroke="#2E7D32"
                                        strokeWidth={2}
                                        name="Revenue"
                                        animationDuration={1000}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="transport"
                                        stroke="#F44336"
                                        strokeWidth={3}
                                        dot={{ r: 4 }}
                                        name="Transport Cost"
                                        animationDuration={1200}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="profit"
                                        stroke="#1B5E20"
                                        strokeWidth={3}
                                        dot={{ r: 5, fill: '#1B5E20' }}
                                        name="Net Profit"
                                        animationDuration={1400}
                                    />
                                </ComposedChart>
                            )}
                        </ResponsiveContainer>
                    </Box>
                </Fade>

                <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block', textAlign: 'center' }}>
                    Showing top 10 mandis sorted by {sortBy}
                </Typography>
            </CardContent>
        </Card>
    );
};

export default ProfitCharts;
