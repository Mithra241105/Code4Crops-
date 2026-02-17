// localStorage utilities for farmer profile and history

const PROFILE_KEY = 'krishi_farmer_profile';
const HISTORY_KEY = 'krishi_optimization_history';

export const saveProfile = (profile) => {
    try {
        localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
        return true;
    } catch (error) {
        console.error('Error saving profile:', error);
        return false;
    }
};

export const getProfile = () => {
    try {
        const profile = localStorage.getItem(PROFILE_KEY);
        return profile ? JSON.parse(profile) : null;
    } catch (error) {
        console.error('Error getting profile:', error);
        return null;
    }
};

export const clearProfile = () => {
    try {
        localStorage.removeItem(PROFILE_KEY);
        return true;
    } catch (error) {
        console.error('Error clearing profile:', error);
        return false;
    }
};

export const saveOptimization = (optimizationData) => {
    try {
        const history = getOptimizationHistory();
        const newEntry = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            ...optimizationData,
        };

        // Keep only last 50 entries
        const updatedHistory = [newEntry, ...history].slice(0, 50);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
        return true;
    } catch (error) {
        console.error('Error saving optimization:', error);
        return false;
    }
};

export const getOptimizationHistory = () => {
    try {
        const history = localStorage.getItem(HISTORY_KEY);
        return history ? JSON.parse(history) : [];
    } catch (error) {
        console.error('Error getting history:', error);
        return [];
    }
};

export const getRecentOptimizations = (count = 5) => {
    const history = getOptimizationHistory();
    return history.slice(0, count);
};

export const clearHistory = () => {
    try {
        localStorage.removeItem(HISTORY_KEY);
        return true;
    } catch (error) {
        console.error('Error clearing history:', error);
        return false;
    }
};

export const getAnalytics = () => {
    const history = getOptimizationHistory();

    if (history.length === 0) {
        return {
            totalOptimizations: 0,
            totalProfitGained: 0,
            mostProfitableMandi: null,
            averageTransportCost: 0,
        };
    }

    const totalOptimizations = history.length;
    const totalProfitGained = history.reduce((sum, entry) => sum + (entry.bestMandi?.netProfit || 0), 0);
    const averageTransportCost = history.reduce((sum, entry) => sum + (entry.bestMandi?.transportCost || 0), 0) / totalOptimizations;

    // Find most profitable mandi
    const mandiCounts = {};
    history.forEach((entry) => {
        if (entry.bestMandi) {
            const name = entry.bestMandi.name;
            mandiCounts[name] = (mandiCounts[name] || 0) + 1;
        }
    });

    const mostProfitableMandi = Object.keys(mandiCounts).length > 0
        ? Object.keys(mandiCounts).reduce((a, b) => mandiCounts[a] > mandiCounts[b] ? a : b)
        : null;

    return {
        totalOptimizations,
        totalProfitGained,
        mostProfitableMandi,
        mostProfitableMandiCount: mostProfitableMandi ? mandiCounts[mostProfitableMandi] : 0,
        averageTransportCost,
    };
};
