import React from 'react';
import { useTranslation } from 'react-i18next';
import { FormControl, MenuItem, Select } from '@mui/material';

const LANGS = [
    { code: 'en', full: 'English' },
    { code: 'hi', full: 'हिन्दी' },
    { code: 'ta', full: 'தமிழ்' },
];

/**
 * theme='light'  → white pill with green text (auth pages / light backgrounds)
 * theme='dark'   → transparent with white text (Navbar)
 *
 * Language is persisted automatically via i18next's LanguageDetector
 * which reads / writes the 'i18nextLng' localStorage key.
 */
const LanguageSwitcher = ({ theme = 'dark' }) => {
    const { i18n } = useTranslation();
    const currentLang = LANGS.find(l => l.code === i18n.language?.split('-')[0])
        ? i18n.language?.split('-')[0]
        : 'en';

    const handleChange = (lang) => {
        // i18next automatically writes 'i18nextLng' to localStorage
        i18n.changeLanguage(lang);
    };

    const isLight = theme === 'light';

    return (
        <FormControl size="small">
            <Select
                value={currentLang}
                onChange={(e) => handleChange(e.target.value)}
                sx={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    letterSpacing: '0.02em',
                    borderRadius: '20px',
                    px: 0.5,
                    ...(isLight ? {
                        bgcolor: 'white',
                        color: '#2E7D32',
                        '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#2E7D32',
                            borderWidth: '1.5px',
                            borderRadius: '20px',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#1B5E20' },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#1B5E20' },
                        '& .MuiSvgIcon-root': { color: '#2E7D32' },
                    } : {
                        color: 'white',
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.45)', borderRadius: '20px' },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                        '& .MuiSvgIcon-root': { color: 'white' },
                    }),
                }}
            >
                {LANGS.map(l => (
                    <MenuItem key={l.code} value={l.code} sx={{ fontSize: '0.85rem', fontWeight: 600 }}>
                        {l.full}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};

export default LanguageSwitcher;
