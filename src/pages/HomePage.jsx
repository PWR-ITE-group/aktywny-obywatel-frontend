import { useNavigate } from 'react-router-dom';
import { Box, Typography, IconButton, Stack, Fab } from '@mui/material';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import SendIcon from '@mui/icons-material/Send';
import RecentReportsCarousel from '../components/Home/RecentReportsCarousel';
import HomeCategoryChips from '../components/Home/HomeCategoryChips';

// URL tła — możesz podmienić na zdjęcie Wrocławia (np. Rynek, Ostrów Tumski).
// Jeśli używasz local asset, zaimportuj go i wstaw w `backgroundImage`.
const BG_IMAGE_URL =
    'https://images.unsplash.com/photo-1578929869335-87f7ae90c01c?auto=format&fit=crop&w=1600&q=70';

const HomePage = () => {
    const navigate = useNavigate();

    return (
        <Box
            sx={{
                position: 'relative',
                minHeight: 'calc(100vh - 68px)', // minus BottomNav
                // Tło — duże zdjęcie Wrocławia z lekkim przyciemnieniem
                backgroundImage: `
                    linear-gradient(180deg, rgba(244,245,247,0) 0%, rgba(91,95,237,0.35) 60%, rgba(91,95,237,0.75) 100%),
                    url(${BG_IMAGE_URL})
                `,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {/* Górny pasek — ikony po prawej, jak na screenie 1 */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    p: 1.5,
                    gap: 1,
                }}
            >
                <IconButton
                    sx={{
                        bgcolor: 'rgba(255,255,255,0.85)',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.95)' },
                    }}
                    size="small"
                    onClick={() => alert('Tarcza bezpieczeństwa: Tutaj będą informacje o alertach i powiadomieniach systemowych.')}
                >
                    <ShieldOutlinedIcon fontSize="small" />
                </IconButton>
                <IconButton
                    sx={{
                        bgcolor: 'rgba(255,255,255,0.85)',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.95)' },
                    }}
                    size="small"
                    onClick={() => alert('Powiadomienia: Tutaj będą wyświetlane powiadomienia o statusie Twoich zgłoszeń.')}
                >
                    <NotificationsNoneIcon fontSize="small" />
                </IconButton>
            </Box>

            {/* Karuzela ostatnich/popularnych zgłoszeń w okolicy */}
            <RecentReportsCarousel />

            {/* Środek — duży przycisk "Zgłoś problem" */}
            <Stack
                alignItems="center"
                justifyContent="center"
                sx={{ flexGrow: 1, py: 4 }}
                spacing={2}
            >
                <Fab
                    color="primary"
                    onClick={() => navigate('/nowe-zgloszenie')}
                    sx={{
                        width: 96,
                        height: 96,
                        boxShadow: '0 10px 30px rgba(91, 95, 237, 0.45)',
                        '& svg': { fontSize: 40 },
                    }}
                    aria-label="Zgłoś problem"
                >
                    <SendIcon sx={{ transform: 'rotate(-15deg)' }} />
                </Fab>
                <Typography
                    variant="h5"
                    fontWeight={700}
                    sx={{
                        color: 'white',
                        textShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    }}
                >
                    Zgłoś problem
                </Typography>
            </Stack>

            {/* Szybkie kategorie u dołu */}
            <Box sx={{ mt: 'auto' }}>
                <HomeCategoryChips />
            </Box>
        </Box>
    );
};

export default HomePage;
