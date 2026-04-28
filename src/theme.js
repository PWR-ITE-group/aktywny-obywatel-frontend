import { createTheme } from '@mui/material/styles';

// Paleta inspirowana aplikacjami typu "Nasz Gorod" / civic apps —
// czysto, niebiesko-fioletowo, bardzo mobilnie.
const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#5B5FED',     // indigo/violet — główny accent
            light: '#7A7DF2',
            dark: '#4246C9',
            contrastText: '#FFFFFF',
        },
        secondary: {
            main: '#1F2937',     // ciemny grafit — drugorzędny tekst/ikony
            light: '#374151',
            dark: '#111827',
        },
        background: {
            default: '#F4F5F7',  // delikatna szarość tła
            paper: '#FFFFFF',
        },
        success: { main: '#16A34A' },  // zielony checkmark przy "Problem naprawiony"
        warning: { main: '#F59E0B' },
        error:   { main: '#EF4444' },
        info:    { main: '#3B82F6' },
        text: {
            primary:   '#111827',
            secondary: '#6B7280',
            disabled:  '#9CA3AF',
        },
        divider: 'rgba(17, 24, 39, 0.08)',
    },
    typography: {
        fontFamily: '"Inter", "Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: { fontWeight: 700, fontSize: '2rem',    letterSpacing: '-0.01em' },
        h2: { fontWeight: 700, fontSize: '1.625rem', letterSpacing: '-0.01em' },
        h3: { fontWeight: 700, fontSize: '1.375rem' },
        h4: { fontWeight: 700, fontSize: '1.125rem' },
        h5: { fontWeight: 600, fontSize: '1rem' },
        h6: { fontWeight: 600, fontSize: '0.9375rem' },
        subtitle1: { fontWeight: 600 },
        body1: { fontSize: '0.9375rem', lineHeight: 1.5 },
        body2: { fontSize: '0.8125rem', lineHeight: 1.45 },
        button: { fontWeight: 600, letterSpacing: 0 },
    },
    shape: {
        borderRadius: 14,
    },
    components: {
        MuiButton: {
            defaultProps: { disableElevation: true },
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: 12,
                    padding: '10px 20px',
                },
                sizeLarge: {
                    padding: '14px 24px',
                    fontSize: '1rem',
                },
                containedPrimary: {
                    '&:hover': { backgroundColor: '#4246C9' },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    boxShadow: '0 1px 3px rgba(17,24,39,0.06), 0 1px 2px rgba(17,24,39,0.04)',
                    border: '1px solid rgba(17, 24, 39, 0.06)',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                rounded: { borderRadius: 16 },
            },
        },
        MuiAppBar: {
            defaultProps: { elevation: 0, color: 'inherit' },
            styleOverrides: {
                root: {
                    backgroundColor: '#FFFFFF',
                    borderBottom: '1px solid rgba(17, 24, 39, 0.06)',
                    color: '#111827',
                },
            },
        },
        MuiBottomNavigation: {
            styleOverrides: {
                root: {
                    height: 68,
                    borderTop: '1px solid rgba(17, 24, 39, 0.06)',
                    backgroundColor: '#FFFFFF',
                },
            },
        },
        MuiBottomNavigationAction: {
            styleOverrides: {
                root: {
                    color: '#9CA3AF',
                    '&.Mui-selected': { color: '#5B5FED' },
                    minWidth: 0,
                    padding: '6px 8px',
                },
                label: {
                    fontSize: '0.75rem',
                    '&.Mui-selected': { fontSize: '0.75rem' },
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 999,
                    fontWeight: 500,
                },
            },
        },
        MuiTextField: {
            defaultProps: { variant: 'outlined' },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    backgroundColor: '#FFFFFF',
                },
            },
        },
    },
});

export default theme;