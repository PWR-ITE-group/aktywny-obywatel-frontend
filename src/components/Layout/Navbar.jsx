import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
    AppBar, Toolbar, Typography, Button, IconButton,
    Box, Menu, MenuItem, Avatar, Chip, Divider,
    useMediaQuery, useTheme, Drawer, List, ListItem,
    ListItemButton, ListItemText, ListItemIcon,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import MapIcon from '@mui/icons-material/Map';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const [anchorEl, setAnchorEl] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);

    const handleLogout = () => {
        handleMenuClose();
        logout();
        navigate('/');
    };

    const navLinks = [
        { label: 'Mapa zgłoszeń', to: '/mapa', icon: <MapIcon /> },
    ];

    const authLinks = user
        ? [
            { label: 'Mój panel', to: '/dashboard', icon: <DashboardIcon /> },
            ...(user.role === 'admin'
                ? [{ label: 'Panel admina', to: '/admin', icon: <AdminPanelSettingsIcon /> }]
                : []),
        ]
        : [];

    return (
        <AppBar position="sticky" elevation={1}>
            <Toolbar>
                {/* Logo */}
                <Box
                    component={RouterLink}
                    to="/"
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        textDecoration: 'none',
                        color: 'inherit',
                        flexGrow: isMobile ? 1 : 0,
                        mr: 3,
                    }}
                >
                    <ReportProblemIcon />
                    <Typography variant="h6" fontWeight={700} noWrap>
                        Aktywny Obywatel
                    </Typography>
                </Box>

                {isMobile ? (
                    <>
                        <IconButton color="inherit" onClick={() => setDrawerOpen(true)}>
                            <MenuIcon />
                        </IconButton>
                        <Drawer
                            anchor="right"
                            open={drawerOpen}
                            onClose={() => setDrawerOpen(false)}
                        >
                            <Box sx={{ width: 260, pt: 2 }}>
                                {user && (
                                    <Box sx={{ px: 2, pb: 2 }}>
                                        <Typography variant="subtitle2" color="text.secondary">
                                            Zalogowany jako
                                        </Typography>
                                        <Typography variant="body1" fontWeight={500}>
                                            {user.email}
                                        </Typography>
                                        {user.role === 'admin' && (
                                            <Chip label="Admin" size="small" color="secondary" sx={{ mt: 0.5 }} />
                                        )}
                                    </Box>
                                )}
                                <Divider />
                                <List>
                                    {[...navLinks, ...authLinks].map((link) => (
                                        <ListItem key={link.to} disablePadding>
                                            <ListItemButton
                                                component={RouterLink}
                                                to={link.to}
                                                onClick={() => setDrawerOpen(false)}
                                            >
                                                <ListItemIcon>{link.icon}</ListItemIcon>
                                                <ListItemText primary={link.label} />
                                            </ListItemButton>
                                        </ListItem>
                                    ))}
                                    <Divider />
                                    {user ? (
                                        <ListItem disablePadding>
                                            <ListItemButton onClick={() => { setDrawerOpen(false); handleLogout(); }}>
                                                <ListItemIcon><LogoutIcon /></ListItemIcon>
                                                <ListItemText primary="Wyloguj się" />
                                            </ListItemButton>
                                        </ListItem>
                                    ) : (
                                        <>
                                            <ListItem disablePadding>
                                                <ListItemButton
                                                    component={RouterLink}
                                                    to="/login"
                                                    onClick={() => setDrawerOpen(false)}
                                                >
                                                    <ListItemText primary="Zaloguj się" />
                                                </ListItemButton>
                                            </ListItem>
                                            <ListItem disablePadding>
                                                <ListItemButton
                                                    component={RouterLink}
                                                    to="/register"
                                                    onClick={() => setDrawerOpen(false)}
                                                >
                                                    <ListItemText primary="Zarejestruj się" />
                                                </ListItemButton>
                                            </ListItem>
                                        </>
                                    )}
                                </List>
                            </Box>
                        </Drawer>
                    </>
                ) : (
                    <>
                        {/* Desktop nav links */}
                        <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
                            {navLinks.map((link) => (
                                <Button
                                    key={link.to}
                                    color="inherit"
                                    component={RouterLink}
                                    to={link.to}
                                    startIcon={link.icon}
                                >
                                    {link.label}
                                </Button>
                            ))}
                            {authLinks.map((link) => (
                                <Button
                                    key={link.to}
                                    color="inherit"
                                    component={RouterLink}
                                    to={link.to}
                                    startIcon={link.icon}
                                >
                                    {link.label}
                                </Button>
                            ))}
                        </Box>

                        {/* Auth buttons */}
                        {user ? (
                            <>
                                <IconButton color="inherit" onClick={handleMenuOpen}>
                                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main', fontSize: 14 }}>
                                        {user.email?.[0]?.toUpperCase()}
                                    </Avatar>
                                </IconButton>
                                <Menu
                                    anchorEl={anchorEl}
                                    open={Boolean(anchorEl)}
                                    onClose={handleMenuClose}
                                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                                >
                                    <MenuItem disabled>
                                        <Box>
                                            <Typography variant="body2" fontWeight={500}>{user.email}</Typography>
                                            {user.role === 'admin' && (
                                                <Chip label="Admin" size="small" color="secondary" />
                                            )}
                                        </Box>
                                    </MenuItem>
                                    <Divider />
                                    <MenuItem
                                        component={RouterLink}
                                        to="/dashboard"
                                        onClick={handleMenuClose}
                                    >
                                        <AccountCircleIcon fontSize="small" sx={{ mr: 1 }} />
                                        Mój panel
                                    </MenuItem>
                                    <MenuItem onClick={handleLogout}>
                                        <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
                                        Wyloguj się
                                    </MenuItem>
                                </Menu>
                            </>
                        ) : (
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button color="inherit" component={RouterLink} to="/logowanie">
                                    Zaloguj się
                                </Button>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    component={RouterLink}
                                    to="/rejestracja"
                                >
                                    Zarejestruj się
                                </Button>
                            </Box>
                        )}
                    </>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;