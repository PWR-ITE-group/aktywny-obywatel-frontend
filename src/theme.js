import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#1565C0',       // niebieski — kolory urzędowe
            light: '#1E88E5',
            dark: '#0D47A1',
        },
        secondary: {
            main: '#00897B',       // zieleń — akcent
        },
        background: {
            default: '#F5F5F5',
            paper: '#FFFFFF',
        },
        error: {
            main: '#C62828',
        },
        success: {
            main: '#2E7D32',
        },
        warning: {
            main: '#F57F17',
        },
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        h4: { fontWeight: 600 },
        h5: { fontWeight: 600 },
        h6: { fontWeight: 600 },
    },
    shape: {
        borderRadius: 8,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 500,
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                },
            },
        },
    },
});

export default theme;