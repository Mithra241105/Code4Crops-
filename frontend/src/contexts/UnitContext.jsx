import React, { createContext, useContext, useState } from 'react';

const UnitContext = createContext(null);

const STORAGE_KEY = 'kr_unit';

/**
 * UnitContext — global kg / quintal preference for the Farmer portal.
 *
 * Helpers:
 *  fmtPrice(pricePerQtl)  → "₹2400/qtl" or "₹24/kg"
 *  fmtQty(quintals)       → "10 qtl" or "1000 kg"
 *  convertPrice(p)        → numeric value in selected unit
 *  unitLabel              → 'qtl' or 'kg'
 */
export const UnitProvider = ({ children }) => {
    const [unit, setUnitRaw] = useState(
        () => (typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null) || 'qtl'
    );

    const setUnit = (u) => {
        setUnitRaw(u);
        try { localStorage.setItem(STORAGE_KEY, u); } catch { }
    };

    const toggleUnit = () => setUnit(unit === 'qtl' ? 'kg' : 'qtl');

    // Convert ₹/qtl price to selected unit (numeric)
    const convertPrice = (pricePerQtl) => {
        if (unit === 'kg') return Math.round(pricePerQtl / 100);
        return pricePerQtl;
    };

    // Format a ₹/qtl price with unit suffix
    const fmtPrice = (pricePerQtl) => {
        const val = convertPrice(pricePerQtl);
        return `₹${val.toLocaleString('en-IN')}/${unit}`;
    };

    // Format a quantity (stored in quintals) with unit suffix
    const fmtQty = (quintals) => {
        if (unit === 'kg') return `${(quintals * 100).toLocaleString('en-IN')} kg`;
        return `${quintals.toLocaleString('en-IN')} qtl`;
    };

    return (
        <UnitContext.Provider value={{ unit, setUnit, toggleUnit, convertPrice, fmtPrice, fmtQty }}>
            {children}
        </UnitContext.Provider>
    );
};

export const useUnit = () => {
    const ctx = useContext(UnitContext);
    if (!ctx) throw new Error('useUnit must be used within UnitProvider');
    return ctx;
};
