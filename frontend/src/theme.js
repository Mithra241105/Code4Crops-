import { createTheme } from '@mui/material/styles';

// ── Shared design tokens ─────────────────────────────────────────────────
const shape = { borderRadius: 12 };

const typography = {
    fontFamily: '"Inter", "Roboto", "Noto Sans", sans-serif',
    h1: { fontWeight: 800, letterSpacing: '-0.5px' },
    h2: { fontWeight: 700, letterSpacing: '-0.3px' },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    body1: { lineHeight: 1.7 },
    button: { fontWeight: 600, textTransform: 'none', letterSpacing: '0.3px' },
};
const shadows = [
    'none',
    '0 1px 3px rgba(0,0,0,0.08)',
    '0 2px 8px rgba(0,0,0,0.1)',
    '0 4px 16px rgba(0,0,0,0.1)',
    '0 8px 24px rgba(0,0,0,0.1)',
    '0 12px 32px rgba(0,0,0,0.1)',
    ...Array(19).fill('none'),
];

const darkShadows = [
    'none',
    '0 1px 4px rgba(0,0,0,0.4)',
    '0 4px 12px rgba(0,0,0,0.5)',
    '0 8px 24px rgba(0,0,0,0.6)',
    '0 12px 40px rgba(0,0,0,0.7)',
    '0 16px 48px rgba(0,0,0,0.8)',
    ...Array(19).fill('none'),
];

// ── Light Theme ──────────────────────────────────────────────────────────
export const lightTheme = createTheme({
    palette: {
        mode: 'light',
        primary: { main: '#2E7D32', dark: '#1B5E20', light: '#4CAF50', contrastText: '#fff' },
        secondary: { main: '#F9A825', dark: '#F57F17', light: '#FDD835', contrastText: '#000' },
        background: { default: '#F7F9FB', paper: '#FFFFFF' },
        success: { main: '#43A047' },
        error: { main: '#E53935' },
        text: { primary: '#1A1A1A', secondary: '#4B5563' },
        divider: '#E5E7EB',
    },
    typography,
    shape,
    shadows,
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    backgroundColor: '#F7F9FB',
                    transition: 'background-color 0.3s ease, color 0.3s ease'
                },
                'input:-webkit-autofill': {
                    WebkitBoxShadow: '0 0 0 1000px #FAFAFA inset !important',
                    WebkitTextFillColor: '#1A1A1A !important',
                    transition: 'background-color 5000s ease-in-out 0s',
                },
            },
        },
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
                    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                    border: '1px solid #E5E7EB',
                    backgroundColor: '#FFFFFF',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: { backgroundImage: 'none' },
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
            styleOverrides: { root: { borderRadius: 8, fontWeight: 600 } },
        },
        MuiAppBar: {
            styleOverrides: {
                root: { background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)' },
            },
        },
        MuiTableHead: {
            styleOverrides: {
                root: {
                    '& .MuiTableCell-head': {
                        backgroundColor: '#F0F4F0',
                        position: 'sticky',
                        top: 0,
                        zIndex: 1,
                    },
                },
            },
        },
        MuiTableRow: {
            styleOverrides: {
                root: {
                    '&:nth-of-type(even)': { backgroundColor: 'rgba(46,125,50,0.03)' },
                    '&:hover': { backgroundColor: 'rgba(46,125,50,0.06) !important' },
                    transition: 'background-color 0.2s ease',
                },
            },
        },
    },
});

// ── Dark Theme ───────────────────────────────────────────────────────────
export const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: { main: '#22C55E', dark: '#16A34A', light: '#4ADE80', contrastText: '#fff' },
        secondary: { main: '#F9A825', dark: '#F57F17', light: '#FDD835', contrastText: '#000' },
        background: { default: '#0F172A', paper: '#1E293B' },
        success: { main: '#22C55E' },
        error: { main: '#F87171' },
        text: { primary: '#F8FAFC', secondary: '#CBD5E1' },
        divider: '#334155',
    },
    typography: {
        ...typography,
        body1: { lineHeight: 1.7, letterSpacing: '0.01em' },
        body2: { letterSpacing: '0.01em' },
        h1: { ...typography.h1, fontWeight: 800 },
        h4: { fontWeight: 750 },
        h5: { fontWeight: 650 },
        h6: { fontWeight: 650 },
    },
    shape,
    shadows: darkShadows,
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    backgroundColor: '#0F172A',
                    transition: 'background-color 0.3s ease, color 0.3s ease'
                },
                'input:-webkit-autofill': {
                    WebkitBoxShadow: '0 0 0 1000px #1E293B inset !important',
                    WebkitTextFillColor: '#F8FAFC !important',
                    transition: 'background-color 5000s ease-in-out 0s',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    padding: '10px 24px',
                    fontSize: '0.95rem',
                    boxShadow: 'none',
                    '&:hover': { boxShadow: '0 4px 16px rgba(34,197,94,0.35)' },
                },
                containedPrimary: {
                    background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
                    color: '#fff',
                    '&:hover': { background: 'linear-gradient(135deg, #4ADE80 0%, #22C55E 100%)' },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    backgroundColor: '#1E293B',
                    backgroundImage: 'none',
                    transition: 'all 0.3s ease-in-out',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: { backgroundImage: 'none' },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 10,
                        backgroundColor: 'rgba(255,255,255,0.04)',
                        '&.Mui-focused fieldset': { borderColor: '#22C55E', borderWidth: 2 },
                    },
                },
            },
        },
        MuiChip: {
            styleOverrides: { root: { borderRadius: 8, fontWeight: 600 } },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    background: 'linear-gradient(135deg, #0F2D1F 0%, #134924 50%, #0F2D1F 100%)',
                    borderBottom: '1px solid rgba(34,197,94,0.15)',
                    boxShadow: '0 2px 20px rgba(0,0,0,0.5)',
                },
            },
        },
        MuiTableHead: {
            styleOverrides: {
                root: {
                    '& .MuiTableCell-head': {
                        backgroundColor: '#162032',
                        position: 'sticky',
                        top: 0,
                        zIndex: 1,
                        color: '#CBD5E1',
                        borderBottomColor: '#334155',
                    },
                },
            },
        },
        MuiTableRow: {
            styleOverrides: {
                root: {
                    '&:nth-of-type(even)': { backgroundColor: 'rgba(34,197,94,0.03)' },
                    '&:hover': { backgroundColor: 'rgba(34,197,94,0.07) !important' },
                    transition: 'background-color 0.2s ease',
                },
            },
        },
        MuiDivider: {
            styleOverrides: { root: { borderColor: '#334155' } },
        },
        MuiBottomNavigation: {
            styleOverrides: {
                root: { backgroundColor: '#1E293B', borderTop: '1px solid #334155' },
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: { backgroundColor: '#1E293B', border: '1px solid #334155' },
            },
        },
        MuiSnackbarContent: {
            styleOverrides: {
                root: { backgroundColor: '#1E3A2A', color: '#F8FAFC', border: '1px solid #334155' },
            },
        },
        MuiTooltip: {
            styleOverrides: {
                tooltip: { backgroundColor: '#0F172A', border: '1px solid #334155', color: '#F8FAFC' },
            },
        },
        MuiAlert: {
            styleOverrides: {
                root: { border: '1px solid', borderColor: 'inherit' },
            },
        },
    },
});

// Default export for any legacy import
export default lightTheme;
