import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ThemeProvider, CssBaseline, CircularProgress, Box, Typography, Button, keyframes } from '@mui/material';
import VerificationPage from './pages/VerificationPage';
import theme from './theme';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layout
import MainLayout from './components/Layout/MainLayout';

// Strony publiczne
import HomePage from './pages/HomePage';
import PublicMapPage from './pages/PublicMapPage';
import ReportDetailPage from './pages/ReportDetailPage';

// Auth
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PasswordResetPage from './pages/PasswordResetPage';

// Strony dla zalogowanego użytkownika
import UserDashboardPage from './pages/UserDashboardPage';
import NewReportPage from './pages/NewReportPage';
import ProfileSettingsPage from './pages/ProfileSettingsPage.jsx';

// Dodatkowe strony
import AplikacjePage from './pages/AplikacjePage';
import TematyPage from './pages/TematyPage';
import UlubionePage from './pages/UlubionePage';
import WiecejPage from './pages/WiecejPage';

// Admin
import AdminPage from './pages/AdminPage';

// Strażnik tras wymagających zalogowania (opcjonalnie z rolą)
const ProtectedRoute = ({ role }) => {
    const { user, loading } = useAuth();
    
    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                <CircularProgress />
            </Box>
        );
    }
    
    if (!user) return <Navigate to="/logowanie" replace />;
    if (role && user.role !== role) return <Navigate to="/" replace />;
    return <Outlet />;
};

const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
`;

const MaintenancePage = ({ onRetry }) => {
    const [retrying, setRetrying] = useState(false);

    const handleRetry = async () => {
        setRetrying(true);
        try {
            await onRetry();
        } finally {
            setTimeout(() => setRetrying(false), 1500);
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #5B5FED 40%, #764ba2 100%)',
                position: 'relative',
                overflow: 'hidden',
                p: 3,
            }}>
                {/* Floating background circles */}
                {[...Array(6)].map((_, i) => (
                    <Box key={i} sx={{
                        position: 'absolute',
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.06)',
                        width: [120, 200, 80, 160, 100, 240][i],
                        height: [120, 200, 80, 160, 100, 240][i],
                        top: [`10%`, `60%`, `20%`, `70%`, `40%`, `5%`][i],
                        left: [`5%`, `70%`, `80%`, `10%`, `50%`, `40%`][i],
                        animation: `${float} ${[6, 8, 5, 7, 9, 10][i]}s ease-in-out infinite`,
                        animationDelay: `${i * 0.5}s`,
                    }} />
                ))}

                {/* Main content card */}
                <Box sx={{
                    position: 'relative',
                    zIndex: 1,
                    background: 'rgba(255,255,255,0.12)',
                    backdropFilter: 'blur(24px)',
                    borderRadius: 4,
                    border: '1px solid rgba(255,255,255,0.2)',
                    p: { xs: 4, sm: 6 },
                    maxWidth: 520,
                    width: '100%',
                    textAlign: 'center',
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                }}>
                    {/* Animated icon */}
                    <Box sx={{
                        fontSize: '4rem',
                        mb: 3,
                        animation: `${float} 3s ease-in-out infinite`,
                    }}>
                        🔧
                    </Box>

                    <Typography variant="h3" sx={{
                        fontWeight: 800,
                        color: '#fff',
                        mb: 1.5,
                        fontSize: { xs: '1.75rem', sm: '2.25rem' },
                        letterSpacing: '-0.02em',
                    }}>
                        Trwają prace serwisowe
                    </Typography>

                    <Typography sx={{
                        color: 'rgba(255,255,255,0.8)',
                        fontSize: '1.05rem',
                        lineHeight: 1.7,
                        mb: 4,
                        maxWidth: 400,
                        mx: 'auto',
                    }}>
                        Nasz serwer chwilowo nie odpowiada. Pracujemy nad tym,
                        aby wszystko wróciło do normy jak najszybciej.
                        Przepraszamy za utrudnienia!
                    </Typography>

                    <Button
                        variant="contained"
                        onClick={handleRetry}
                        disabled={retrying}
                        sx={{
                            background: '#fff',
                            color: '#5B5FED',
                            fontWeight: 700,
                            fontSize: '1rem',
                            px: 5,
                            py: 1.5,
                            borderRadius: 3,
                            textTransform: 'none',
                            boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                            '&:hover': {
                                background: '#f0f0ff',
                                boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                            },
                            '&:disabled': {
                                background: 'rgba(255,255,255,0.5)',
                                color: 'rgba(91,95,237,0.5)',
                            },
                        }}
                    >
                        {retrying ? (
                            <CircularProgress size={22} sx={{ color: '#5B5FED', mr: 1 }} />
                        ) : null}
                        {retrying ? 'Sprawdzam...' : 'Spróbuj ponownie'}
                    </Button>

                    <Typography sx={{
                        color: 'rgba(255,255,255,0.45)',
                        fontSize: '0.8rem',
                        mt: 4,
                        animation: `${pulse} 2s ease-in-out infinite`,
                    }}>
                        Aktywny Obywatel • System zgłoszeń
                    </Typography>
                </Box>
            </Box>
        </ThemeProvider>
    );
};

const App = () => {
    const [backendDown, setBackendDown] = useState(false);

    useEffect(() => {
        const handleBackendDown = () => setBackendDown(true);
        window.addEventListener('backend-down', handleBackendDown);
        return () => window.removeEventListener('backend-down', handleBackendDown);
    }, []);

    // Health check on app start — detect if backend is completely down
    useEffect(() => {
        const checkBackend = async () => {
            try {
                const baseUrl = import.meta.env.VITE_API_URL ?? '';
                const res = await fetch(`${baseUrl}/api/complaints?page=0&size=1`, {
                    method: 'GET',
                    signal: AbortSignal.timeout(5000),
                });
                if (!res.ok) {
                    setBackendDown(true);
                }
            } catch {
                setBackendDown(true);
            }
        };
        checkBackend();
    }, []);

    const handleRetry = useCallback(async () => {
        try {
            const baseUrl = import.meta.env.VITE_API_URL ?? '';
            const res = await fetch(`${baseUrl}/api/complaints?page=0&size=1`, { method: 'GET' });
            if (res.ok) {
                setBackendDown(false);
                window.location.reload();
            }
        } catch {
            // still down
        }
    }, []);

    if (backendDown) {
        return <MaintenancePage onRetry={handleRetry} />;
    }

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
                <BrowserRouter>
                    <Routes>
                        {/* Trasy z dolną nawigacją / topbarem */}
                        <Route element={<MainLayout />}>
                            {/* publiczne */}
                            <Route path="/" element={<HomePage />} />
                            <Route path="/mapa" element={<PublicMapPage />} />
                            <Route path="/zgloszenie/:id" element={<ReportDetailPage />} />

                            {/* Strony z BottomNav (WF-01, WF-04) */}
                            <Route path="/aplikacje" element={<AplikacjePage />} />
                            <Route path="/tematy" element={<TematyPage />} />
                            <Route path="/ulubione" element={<UlubionePage />} />
                            <Route path="/wiecej" element={<WiecejPage />} />

                            {/* zalogowany */}
                            <Route element={<ProtectedRoute />}>
                                <Route path="/dashboard" element={<UserDashboardPage />} />
                                <Route path="/nowe-zgloszenie" element={<NewReportPage />} />
                                <Route path="/ustawienia" element={<ProfileSettingsPage />} />
                            </Route>

                            {/* admin */}
                            <Route element={<ProtectedRoute role="admin" />}>
                                <Route path="/admin" element={<AdminPage />} />
                            </Route>
                        </Route>

                        {/* Trasy bez layoutu (auth) */}
                        <Route path="/logowanie" element={<LoginPage />} />
                        <Route path="/rejestracja" element={<RegisterPage />} />
                        <Route path="/reset-hasla" element={<PasswordResetPage />} />

                        <Route path="/weryfikacja" element={<VerificationPage />} />
                        {/* 404 */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </BrowserRouter>
            </AuthProvider>
        </ThemeProvider>
    );
};

export default App;
