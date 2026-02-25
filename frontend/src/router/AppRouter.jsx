import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoginPage from '../pages/auth/LoginPage';
import SignupPage from '../pages/auth/SignupPage';
import OtpVerifyPage from '../pages/auth/OtpVerifyPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';
import FarmerDashboard from '../pages/farmer/FarmerDashboard';
import MandiDashboard from '../pages/mandi/MandiDashboard';

const ProtectedRoute = ({ children, requiredRole }) => {
    const { user } = useAuth();
    if (!user) return <Navigate to="/auth/login" replace />;
    if (requiredRole && user.role !== requiredRole) {
        return <Navigate to={user.role === 'farmer' ? '/farmer' : '/mandi'} replace />;
    }
    return children;
};

const AppRouter = () => {
    const { user } = useAuth();
    return (
        <BrowserRouter>
            <Routes>
                {/* Root redirect */}
                <Route path="/" element={
                    user ? <Navigate to={user.role === 'farmer' ? '/farmer' : '/mandi'} replace /> : <Navigate to="/auth/login" replace />
                } />
                {/* Auth routes */}
                <Route path="/auth/login" element={user ? <Navigate to={user.role === 'farmer' ? '/farmer' : '/mandi'} replace /> : <LoginPage />} />
                <Route path="/auth/signup" element={user ? <Navigate to={user.role === 'farmer' ? '/farmer' : '/mandi'} replace /> : <SignupPage />} />
                <Route path="/auth/verify-otp" element={<OtpVerifyPage />} />
                <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
                {/* Farmer portal */}
                <Route path="/farmer/*" element={
                    <ProtectedRoute requiredRole="farmer"><FarmerDashboard /></ProtectedRoute>
                } />
                {/* Mandi portal */}
                <Route path="/mandi/*" element={
                    <ProtectedRoute requiredRole="mandi"><MandiDashboard /></ProtectedRoute>
                } />
                {/* 404 */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRouter;
