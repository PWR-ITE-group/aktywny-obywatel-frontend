import { useNavigate, useLocation } from 'react-router-dom';
import {
    Paper, BottomNavigation, BottomNavigationAction, Badge, Box,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/HomeOutlined';
import AppsIcon from '@mui/icons-material/AppsOutlined';
import TopicIcon from '@mui/icons-material/ListAltOutlined';
import BookmarkIcon from '@mui/icons-material/BookmarkBorderOutlined';
import MenuIcon from '@mui/icons-material/MenuOutlined';

// Mapowanie zakładki -> ścieżka. Kluczowe: kolejność jak na screenach.
const TABS = [
    { value: '/',                  label: 'Dom',       icon: <HomeIcon /> },
    { value: '/aplikacje',         label: 'Aplikacje', icon: <AppsIcon /> },
    { value: '/tematy',            label: 'Tematy',    icon: <TopicIcon /> },
    { value: '/ulubione',          label: 'Ulubione',  icon: <BookmarkIcon /> },
    { value: '/wiecej',            label: 'Więcej',    icon: <MenuIcon />, badge: 69 },
];

// Które ścieżki "mapują się" na którą zakładkę (żeby np. /nowe-zgloszenie nie gasiło zakładki Dom)
const pathToTab = (pathname) => {
    if (pathname === '/' || pathname.startsWith('/mapa') || pathname.startsWith('/nowe-zgloszenie')) return '/';
    if (pathname.startsWith('/aplikacje')) return '/aplikacje';
    if (pathname.startsWith('/tematy')) return '/tematy';
    if (pathname.startsWith('/ulubione')) return '/ulubione';
    if (pathname.startsWith('/wiecej') || pathname.startsWith('/dashboard')) return '/wiecej';
    return '/';
};

const BottomNav = () => {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const value = pathToTab(pathname);

    return (
        <Paper
            elevation={0}
            sx={{
                position: 'fixed',
                bottom: 0, left: 0, right: 0,
                zIndex: (t) => t.zIndex.appBar,
                display: { xs: 'block', md: 'none' }, // mobile-only
                borderRadius: 0,
            }}
        >
            <BottomNavigation
                showLabels
                value={value}
                onChange={(_, newVal) => navigate(newVal)}
            >
                {TABS.map((tab) => (
                    <BottomNavigationAction
                        key={tab.value}
                        value={tab.value}
                        label={tab.label}
                        icon={
                            tab.badge ? (
                                <Badge
                                    badgeContent={tab.badge}
                                    color="primary"
                                    sx={{ '& .MuiBadge-badge': { fontSize: 10, height: 16, minWidth: 16 } }}
                                >
                                    {tab.icon}
                                </Badge>
                            ) : tab.icon
                        }
                    />
                ))}
            </BottomNavigation>
            {/* Wcięcie bezpieczeństwa pod home indicator (iOS) */}
            <Box sx={{ height: 'env(safe-area-inset-bottom)' }} />
        </Paper>
    );
};

export default BottomNav;
