import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Box, BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import { TrendingUp, History, Person } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { UnitProvider } from '../../contexts/UnitContext';
import Navbar from '../../components/Layout/Navbar';
import OptimizePage from './OptimizePage';
import HistoryPage from './HistoryPage';
import FarmerProfilePage from './FarmerProfilePage';
import Chatbot from '../../components/Chatbot/Chatbot';

const FarmerDashboard = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    const tabs = [
        { path: '/farmer', label: t('nav.optimize'), icon: <TrendingUp /> },
        { path: '/farmer/history', label: t('nav.history'), icon: <History /> },
        { path: '/farmer/profile', label: t('nav.profile'), icon: <Person /> },
    ];

    const currentTab = tabs.findIndex(tab =>
        tab.path === '/farmer' ? location.pathname === '/farmer' || location.pathname === '/farmer/'
            : location.pathname.startsWith(tab.path)
    );

    return (
        <UnitProvider>
            <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: { xs: 8, sm: 0 } }}>
                <Navbar role="farmer" />

                <Box>
                    <Routes>
                        <Route index element={<OptimizePage />} />
                        <Route path="history" element={<HistoryPage />} />
                        <Route path="profile" element={<FarmerProfilePage />} />
                    </Routes>
                </Box>

                {/* Bottom navigation for mobile */}
                <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, display: { sm: 'none' }, zIndex: 1100, borderTop: '1px solid rgba(0,0,0,0.1)' }} elevation={3}>
                    <BottomNavigation value={currentTab < 0 ? 0 : currentTab}
                        onChange={(_, v) => navigate(tabs[v].path)}
                        sx={{ '& .Mui-selected': { color: 'primary.main' }, height: 60 }}>
                        {tabs.map(tab => (
                            <BottomNavigationAction key={tab.path} label={tab.label} icon={tab.icon} />
                        ))}
                    </BottomNavigation>
                </Paper>

                {/* AI Chatbot floating */}
                <Chatbot />
            </Box>
        </UnitProvider>
    );
};

export default FarmerDashboard;
