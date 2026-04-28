import { useState, useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
    Container, Box, Typography, Tabs, Tab, Button, Card, CardContent, Stack,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { useAuth } from '../context/AuthContext';
import ReportStatusCard from '../components/Dashboard/ReportStatusCard';

// Przykładowe zgłoszenia użytkownika — docelowo z API.
// Zawiera "odpowiedź urzędu" i zdjęcia, żeby pokazać widok jak na screenie 5.
const MOCK_USER_REPORTS = [
    {
        id: 1,
        title: 'Przepełniony kosz na śmieci',
        category: 'Odpady',
        status: 'zakończone',
        location: 'ul. Świdnicka 12, Wrocław',
        description: 'Kosz przy parku przepełniony od kilku dni.',
        authorityName: 'Larin A. S.',
        authorityRole: 'Szef Stowarzyszenia Inspektoratów Administracyjno-Technicznych Miasta Wrocławia',
        response:
            'Szanowny użytkowniku! Badanie wykazało, że liczba pojemników na odpady ' +
            'odpowiada danym w zautomatyzowanym systemie informacyjnym "Elektroniczny ' +
            'Model Terytorialnego Systemu Gospodarki Odpadami".',
        photos: [
            'https://placehold.co/400x240/E0E7FF/1F2937?text=Portal',
            'https://placehold.co/400x240/EDE9FE/1F2937?text=Mapa',
            'https://placehold.co/400x240/FEE2E2/1F2937?text=Dokument',
            'https://placehold.co/400x240/1F2937/FFFFFF?text=Portal',
            'https://placehold.co/400x240/000/fff?text=Extra',
            'https://placehold.co/400x240/000/fff?text=Extra',
        ],
        publishedAt: '16 grudnia 2025 r. o godz. 15:33',
        createdAt: '2025-12-01',
    },
    {
        id: 2,
        title: 'Dziura w jezdni',
        category: 'Drogi i chodniki',
        status: 'w realizacji',
        location: 'ul. Powstańców Śląskich 5',
        description: 'Duża dziura w jezdni, stanowi zagrożenie dla rowerzystów.',
        createdAt: '2026-04-10',
    },
];

const FILTERS = [
    { value: 'all',     label: 'Wszystkie' },
    { value: 'active',  label: 'Aktywne' },
    { value: 'done',    label: 'Zakończone' },
];

const UserDashboardPage = () => {
    const { user } = useAuth();
    const [tab, setTab] = useState('all');

    const filtered = useMemo(() => {
        if (tab === 'active') return MOCK_USER_REPORTS.filter((r) => r.status !== 'zakończone' && r.status !== 'odrzucone');
        if (tab === 'done')   return MOCK_USER_REPORTS.filter((r) => r.status === 'zakończone');
        return MOCK_USER_REPORTS;
    }, [tab]);

    return (
        <Container maxWidth="md" sx={{ py: 3 }}>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                    gap: 1,
                }}
            >
                <Box sx={{ minWidth: 0 }}>
                    <Typography variant="h5" fontWeight={700}>
                        Moje zgłoszenia
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                        Witaj, {user?.email}
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddCircleOutlineIcon />}
                    component={RouterLink}
                    to="/nowe-zgloszenie"
                    sx={{ flexShrink: 0 }}
                >
                    Nowe
                </Button>
            </Box>

            <Tabs
                value={tab}
                onChange={(_, v) => setTab(v)}
                sx={{
                    mb: 2,
                    '& .MuiTab-root': { textTransform: 'none', fontWeight: 600 },
                }}
            >
                {FILTERS.map((f) => (
                    <Tab key={f.value} value={f.value} label={f.label} />
                ))}
            </Tabs>

            {filtered.length === 0 ? (
                <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center', py: 6 }}>
                        <Stack spacing={1.5} alignItems="center">
                            <Typography variant="h6" color="text.secondary">
                                Nie masz jeszcze żadnych zgłoszeń
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360 }}>
                                Kliknij "Nowe zgłoszenie", żeby zgłosić problem w Twoim mieście.
                            </Typography>
                            <Button
                                variant="contained"
                                startIcon={<AddCircleOutlineIcon />}
                                component={RouterLink}
                                to="/nowe-zgloszenie"
                            >
                                Złóż pierwsze zgłoszenie
                            </Button>
                        </Stack>
                    </CardContent>
                </Card>
            ) : (
                <Box>
                    {filtered.map((report) => (
                        <ReportStatusCard key={report.id} report={report} />
                    ))}
                </Box>
            )}
        </Container>
    );
};

export default UserDashboardPage;
