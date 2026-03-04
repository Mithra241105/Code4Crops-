import React from 'react';
import { Box, Typography } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';
import { useTranslation } from 'react-i18next';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <Box sx={{
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                p: 1.5,
                boxShadow: 4
            }}>
                <Typography variant="body2" fontWeight={700} mb={0.5} color="text.primary">{label}</Typography>
                {payload.map((p, i) => (
                    <Typography key={i} variant="caption" display="block" sx={{ color: p.color, fontWeight: 600 }}>
                        {p.name}: ₹{Number(p.value).toLocaleString('en-IN')}
                    </Typography>
                ))}
            </Box>
        );
    }
    return null;
};

const ProfitChart = ({ results = [] }) => {
    const { t } = useTranslation();
    if (results.length === 0) return null;

    const data = results.map(r => ({
        name: r.mandiName?.split(' ')[0] || 'Mandi',
        [t('farmer.netProfit')]: Math.max(0, r.netProfit),
        [t('farmer.transportCost')]: r.transportCost,
        [t('farmer.handlingCost')]: r.handlingCost,
    }));

    return (
        <Box>
            <Typography variant="h6" fontWeight={700} mb={2}>{t('smart.profitComparison')}</Typography>
            <ResponsiveContainer width="100%" height={240}>
                <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
                    <Bar dataKey={t('farmer.netProfit')} fill="#4ADE80" radius={[4, 4, 0, 0]} />
                    <Bar dataKey={t('farmer.transportCost')} fill="#F87171" radius={[4, 4, 0, 0]} />
                    <Bar dataKey={t('farmer.handlingCost')} fill="#FBBF24" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </Box>
    );
};

export default ProfitChart;
