import { Outlet, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import Navbar from './Navbar';
import BottomNav from './BottomNav';
import TranslateWidget from '../TranslateWidget';

// Trasy, na których ukrywamy górny pasek (pełnoekranowa mapa itp.)
const HIDE_NAVBAR_ROUTES = ['/mapa'];

const MainLayout = () => {
    const { pathname } = useLocation();
    const hideNavbar = HIDE_NAVBAR_ROUTES.includes(pathname);

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh',
                bgcolor: 'background.default',
            }}
        >
            {!hideNavbar && <Navbar />}
            <TranslateWidget />

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    // padding-bottom, żeby content nie był przykryty dolną nawigacją
                    pb: { xs: '72px', md: 0 },
                }}
            >
                <Outlet />
            </Box>

            {/* Dolna nawigacja — widoczna tylko na mobile, jak w Nasz Gorod */}
            <BottomNav />
        </Box>
    );
};

export default MainLayout;
