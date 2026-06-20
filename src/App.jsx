import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ThemeProvider, CssBaseline, CircularProgress, Box } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import VerificationPage from './pages/VerificationPage';
import UserProfilePage from './pages/UserProfilePage';
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

const App = () => {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
                <BrowserRouter>
                    <Toaster position="top-center" />
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
                                <Route path="/profil" element={<UserProfilePage />} />
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
