import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#2E7D32', // Agriculture green
            light: '#4CAF50',
            dark: '#1B5E20',
            contrastText: '#fff',
        },
        secondary: {
            main: '#66BB6A',
            light: '#81C784',
            dark: '#388E3C',
        },
        background: {
            default: '#f4fdf4',
            paper: '#ffffff',
        },
        success: {
            main: '#2E7D32',
        },
        warning: {
            main: '#FFA726',
        },
        error: {
            main: '#EF5350',
        },
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
            fontSize: '3rem',
            fontWeight: 700,
        },
        h2: {
            fontSize: '2.5rem',
            fontWeight: 600,
        },
        h3: {
            fontSize: '2rem',
            fontWeight: 600,
        },
        h4: {
            fontSize: '1.75rem',
            fontWeight: 600,
        },
        h5: {
            fontSize: '1.5rem',
            fontWeight: 500,
        },
        h6: {
            fontSize: '1.25rem',
            fontWeight: 500,
        },
        body1: {
            fontSize: '1rem',
        },
        body2: {
            fontSize: '0.875rem',
        },
    },
    shape: {
        borderRadius: 12,
    },
    spacing: 8,
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 600,
                    padding: '10px 24px',
                },
                contained: {
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    '&:hover': {
                        boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    '&:hover': {
                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    },
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                            borderColor: '#2E7D32',
                        },
                    },
                },
            },
        },
    },
});

export default theme;
