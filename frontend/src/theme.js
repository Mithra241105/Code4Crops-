import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: { main: '#2E7D32', dark: '#1B5E20', light: '#4CAF50', contrastText: '#fff' },
        secondary: { main: '#F9A825', dark: '#F57F17', light: '#FDD835', contrastText: '#000' },
        background: { default: '#F8FAF8', paper: '#FFFFFF' },
        success: { main: '#43A047' },
        error: { main: '#E53935' },
        text: { primary: '#1A2332', secondary: '#5A6A7A' },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Noto Sans", sans-serif',
        h1: { fontWeight: 800, letterSpacing: '-0.5px' },
        h2: { fontWeight: 700, letterSpacing: '-0.3px' },
        h3: { fontWeight: 700 },
        h4: { fontWeight: 700 },
        h5: { fontWeight: 600 },
        h6: { fontWeight: 600 },
        body1: { lineHeight: 1.7 },
        button: { fontWeight: 600, textTransform: 'none', letterSpacing: '0.3px' },
    },
    shape: { borderRadius: 12 },
    shadows: [
        'none',
        '0 1px 3px rgba(0,0,0,0.08)',
        '0 2px 8px rgba(0,0,0,0.1)',
        '0 4px 16px rgba(0,0,0,0.1)',
        '0 8px 24px rgba(0,0,0,0.1)',
        '0 12px 32px rgba(0,0,0,0.1)',
        ...Array(19).fill('none'),
    ],
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    padding: '10px 24px',
                    fontSize: '0.95rem',
                    boxShadow: 'none',
                    '&:hover': { boxShadow: '0 4px 12px rgba(46,125,50,0.3)' },
                },
                containedPrimary: {
                    background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)',
                    '&:hover': { background: 'linear-gradient(135deg, #388e3c 0%, #2E7D32 100%)' },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                    border: '1px solid rgba(0,0,0,0.06)',
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 10,
                        backgroundColor: '#FAFAFA',
                        '&.Mui-focused fieldset': { borderColor: '#2E7D32', borderWidth: 2 },
                    },
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: { borderRadius: 8, fontWeight: 600 },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: { background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)' },
            },
        },
    },
});

export default theme;
