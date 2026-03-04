import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext({ mode: 'light', toggleTheme: () => { } });

export const ThemeContextProvider = ({ children }) => {
    const [mode, setMode] = useState(() => {
        const stored = localStorage.getItem('krishi-theme');
        if (stored === 'light' || stored === 'dark') return stored;
        // Auto-detect system preference on first load
        return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });

    useEffect(() => {
        localStorage.setItem('krishi-theme', mode);
    }, [mode]);

    const toggleTheme = () => setMode(prev => (prev === 'light' ? 'dark' : 'light'));

    return (
        <ThemeContext.Provider value={{ mode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useThemeMode = () => useContext(ThemeContext);
