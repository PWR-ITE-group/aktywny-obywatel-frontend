import { Outlet, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import Navbar from './Navbar';
import BottomNav from './BottomNav';
import TranslateWidget from '../TranslateWidget';
import backgroundImg from '../../assets/luk_wro-centennial-hall.jpg';

// Trasy, na których ukrywamy górny pasek (pełnoekranowa mapa itp.)
const HIDE_NAVBAR_ROUTES = ['/mapa'];

// Metadata: background image source: https://pixabay.com/photos/centennial-hall-wroclaw-poland-4496672/

const MainLayout = () => {
    const { pathname } = useLocation();
    const hideNavbar = HIDE_NAVBAR_ROUTES.includes(pathname);

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh',
                //backgroundImage: `url(${backgroundImg})`,
                //backgroundSize: 'cover',
                //backgroundPosition: 'center',
                //backgroundRepeat: 'no-repeat',
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
