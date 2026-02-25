import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try { return JSON.parse(localStorage.getItem('kr_user')); } catch { return null; }
    });
    const [loading, setLoading] = useState(false);

    const login = async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        localStorage.setItem('kr_token', data.token);
        localStorage.setItem('kr_user', JSON.stringify(data.user));
        setUser(data.user);
        return data.user;
    };

    const signup = async (name, email, password, role) => {
        const { data } = await api.post('/auth/signup', { name, email, password, role });
        return data;
    };

    const verifyOtp = async (email, otp) => {
        const { data } = await api.post('/auth/verify-otp', { email, otp });
        localStorage.setItem('kr_token', data.token);
        localStorage.setItem('kr_user', JSON.stringify(data.user));
        setUser(data.user);
        return data.user;
    };

    const resendOtp = async (email) => {
        const { data } = await api.post('/auth/resend-otp', { email });
        return data;
    };

    const forgotPassword = async (email) => {
        const { data } = await api.post('/auth/forgot-password', { email });
        return data;
    };

    const resetPassword = async (email, otp, newPassword) => {
        const { data } = await api.post('/auth/reset-password', { email, otp, newPassword });
        return data;
    };

    const changePassword = async (oldPassword, newPassword) => {
        const { data } = await api.post('/auth/change-password', { oldPassword, newPassword });
        return data;
    };

    const logout = () => {
        localStorage.removeItem('kr_token');
        localStorage.removeItem('kr_user');
        setUser(null);
    };

    const updateUser = (updates) => {
        const updated = { ...user, ...updates };
        localStorage.setItem('kr_user', JSON.stringify(updated));
        setUser(updated);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, verifyOtp, resendOtp, forgotPassword, resetPassword, changePassword, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
