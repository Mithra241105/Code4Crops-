import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Box, BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import { Dashboard, Person, BarChart } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import Navbar from '../../components/Layout/Navbar';
import MandiPricesPage from './MandiPricesPage';
import MandiProfilePage from './MandiProfilePage';
import MandiAnalyticsPage from './MandiAnalyticsPage';

const MandiDashboard = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();

    const tabs = [
        { path: '/mandi', label: t('nav.prices'), icon: <Dashboard /> },
        { path: '/mandi/analytics', label: t('nav.analytics'), icon: <BarChart /> },
        { path: '/mandi/profile', label: t('nav.profile'), icon: <Person /> },
    ];

    const currentTab = tabs.findIndex(tab =>
        tab.path === '/mandi' ? location.pathname === '/mandi' || location.pathname === '/mandi/' : location.pathname.startsWith(tab.path)
    );

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: { xs: 9, sm: 0 } }}>
            <Navbar role="mandi" />
            <Routes>
                <Route index element={<MandiPricesPage />} />
                <Route path="analytics" element={<MandiAnalyticsPage />} />
                <Route path="profile" element={<MandiProfilePage />} />
            </Routes>
            <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, display: { sm: 'none' }, zIndex: 1100, borderTop: '1px solid', borderColor: 'divider' }} elevation={3}>
                <BottomNavigation value={currentTab < 0 ? 0 : currentTab} onChange={(_, v) => navigate(tabs[v].path)} sx={{ '& .Mui-selected': { color: 'primary.main' }, height: 60 }}>
                    {tabs.map(tab => <BottomNavigationAction key={tab.path} label={tab.label} icon={tab.icon} sx={{ minWidth: 0 }} />)}
                </BottomNavigation>
            </Paper>
        </Box>
    );
};

export default MandiDashboard;
