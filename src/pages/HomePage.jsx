import { Link as RouterLink } from 'react-router-dom';
import {
    Box, Container, Typography, Button, Grid,
    Card, CardContent, Stack,
} from '@mui/material';
import MapIcon from '@mui/icons-material/Map';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import { useAuth } from '../context/AuthContext';

const features = [
    {
        icon: <ReportProblemIcon color="primary" sx={{ fontSize: 40 }} />,
        title: 'Zgłoś problem',
        desc: 'Opisz problem, zrób zdjęcie i zaznacz lokalizację na mapie. Formularz zajmie Ci mniej niż minutę.',
    },
    {
        icon: <TrackChangesIcon color="primary" sx={{ fontSize: 40 }} />,
        title: 'Śledź status',
        desc: 'Obserwuj co dzieje się ze zgłoszeniem — od przyjęcia przez urząd, aż do rozwiązania.',
    },
    {
        icon: <NotificationsActiveIcon color="primary" sx={{ fontSize: 40 }} />,
        title: 'Otrzymuj powiadomienia',
        desc: 'Dostaniesz emaila lub powiadomienie push przy każdej zmianie statusu Twojego zgłoszenia.',
    },
    {
        icon: <MapIcon color="primary" sx={{ fontSize: 40 }} />,
        title: 'Publiczna mapa',
        desc: 'Zobacz wszystkie aktywne zgłoszenia w okolicy. Sprawdź czy ktoś już zgłosił ten sam problem.',
    },
];

const HomePage = () => {
    const { user } = useAuth();

    return (
        <Box>
            {/* Hero */}
            <Box
                sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    py: { xs: 6, md: 10 },
                }}
            >
                <Container maxWidth="md">
                    <Stack spacing={3} alignItems="center" textAlign="center">
                        <Typography variant="h3" fontWeight={700} component="h1">
                            Zgłoś problem w&nbsp;Twoim mieście
                        </Typography>
                        <Typography variant="h6" sx={{ opacity: 0.9, maxWidth: 520 }}>
                            Aktywny Obywatel to platforma dla mieszkańców Wrocławia do zgłaszania
                            problemów infrastrukturalnych. Twoje zgłoszenie trafi bezpośrednio
                            do właściwego wydziału Urzędu Miejskiego.
                        </Typography>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} pt={1}>
                            {user ? (
                                <Button
                                    variant="contained"
                                    size="large"
                                    color="secondary"
                                    component={RouterLink}
                                    to="/dashboard"
                                    startIcon={<ReportProblemIcon />}
                                >
                                    Złóż zgłoszenie
                                </Button>
                            ) : (
                                <>
                                    <Button
                                        variant="contained"
                                        size="large"
                                        color="secondary"
                                        component={RouterLink}
                                        to="/register"
                                    >
                                        Zacznij zgłaszać
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        size="large"
                                        sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)' }}
                                        component={RouterLink}
                                        to="/mapa"
                                        startIcon={<MapIcon />}
                                    >
                                        Zobacz mapę
                                    </Button>
                                </>
                            )}
                        </Stack>
                    </Stack>
                </Container>
            </Box>

            {/* Features */}
            <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
                <Typography variant="h4" textAlign="center" gutterBottom>
                    Jak to działa?
                </Typography>
                <Typography
                    variant="body1"
                    textAlign="center"
                    color="text.secondary"
                    sx={{ mb: 6 }}
                >
                    Trzy kroki wystarczą żeby zgłoszenie trafiło do odpowiedniego urzędu.
                </Typography>
                <Grid container spacing={3}>
                    {features.map((f) => (
                        <Grid item xs={12} sm={6} md={3} key={f.title}>
                            <Card sx={{ height: '100%', p: 1 }}>
                                <CardContent>
                                    <Box sx={{ mb: 2 }}>{f.icon}</Box>
                                    <Typography variant="h6" gutterBottom>
                                        {f.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {f.desc}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>

            {/* CTA strip */}
            <Box sx={{ bgcolor: 'grey.100', py: 6 }}>
                <Container maxWidth="sm">
                    <Stack spacing={2} alignItems="center" textAlign="center">
                        <Typography variant="h5" fontWeight={600}>
                            Wrocław bez barier — zacznij od swojego podwórka
                        </Typography>
                        <Button
                            variant="contained"
                            size="large"
                            component={RouterLink}
                            to={user ? '/dashboard' : '/register'}
                        >
                            {user ? 'Złóż zgłoszenie' : 'Zarejestruj się bezpłatnie'}
                        </Button>
                    </Stack>
                </Container>
            </Box>
        </Box>
    );
};

export default HomePage;