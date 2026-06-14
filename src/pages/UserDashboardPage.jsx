import { useState, useMemo, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
    Container, Box, Typography, Tabs, Tab, Button, Card, CardContent, Stack, CircularProgress, Alert,
    TextField, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { useAuth } from '../context/AuthContext';
import ReportStatusCard from '../components/Dashboard/ReportStatusCard';
import { complaintService } from '../services/complaintService';

const FILTERS = [
    { value: 'all',     label: 'Wszystkie' },
    { value: 'active',  label: 'Aktywne' },
    { value: 'done',    label: 'Zakończone' },
];

const UserDashboardPage = () => {
    const { user } = useAuth();
    const [tab, setTab] = useState('all');
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Advanced filters
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [sortOrder, setSortOrder] = useState('desc'); // 'desc' or 'asc'

    useEffect(() => {
        const fetchReports = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await complaintService.getAll();
                // Filter to show only the user's reports if the API returns all
                const userReports = data.filter(r => r.userId === user?.id);
                setReports(userReports);
            } catch (err) {
                console.error("Failed to load reports", err);
                setError('Nie udało się załadować zgłoszeń. Spróbuj ponownie później.');
            } finally {
                setLoading(false);
            }
        };

        if (user?.id) {
            fetchReports();
        } else {
            setLoading(false);
        }
    }, [user?.id]);

    const availableCategories = useMemo(() => {
        const cats = new Set(reports.map(r => r.category).filter(Boolean));
        return Array.from(cats);
    }, [reports]);

    const filtered = useMemo(() => {
        let result = reports;

        // 1. Tab filter (Status)
        if (tab === 'active') {
            result = result.filter((r) => r.status !== 'RESOLVED' && r.status !== 'zakończone' && r.status !== 'odrzucone');
        } else if (tab === 'done') {
            result = result.filter((r) => r.status === 'RESOLVED' || r.status === 'zakończone');
        }

        // 2. Category filter
        if (selectedCategory) {
            result = result.filter((r) => r.category === selectedCategory);
        }

        // 3. Search text
        if (searchQuery.trim() !== '') {
            const q = searchQuery.toLowerCase();
            result = result.filter((r) => 
                (r.title && r.title.toLowerCase().includes(q)) ||
                (r.description && r.description.toLowerCase().includes(q)) ||
                (r.address?.street && r.address.street.toLowerCase().includes(q)) ||
                (r.address?.displayName && r.address.displayName.toLowerCase().includes(q))
            );
        }

        // 4. Sorting
        result = [...result].sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        });

        return result;
    }, [tab, reports, selectedCategory, searchQuery, sortOrder]);

    if (loading) {
        return (
            <Container maxWidth="md" sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="md" sx={{ py: 6 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

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

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
                <TextField
                    size="small"
                    placeholder="Szukaj (tytuł, opis, adres)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{ flexGrow: 1 }}
                />
                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Kategoria</InputLabel>
                    <Select
                        value={selectedCategory}
                        label="Kategoria"
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        <MenuItem value="">Wszystkie</MenuItem>
                        {availableCategories.map(cat => (
                            <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Sortowanie</InputLabel>
                    <Select
                        value={sortOrder}
                        label="Sortowanie"
                        onChange={(e) => setSortOrder(e.target.value)}
                    >
                        <MenuItem value="desc">Od najnowszych</MenuItem>
                        <MenuItem value="asc">Od najstarszych</MenuItem>
                    </Select>
                </FormControl>
            </Stack>

            {filtered.length === 0 ? (
                <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center', py: 6 }}>
                        <Stack spacing={1.5} alignItems="center">
                            <Typography variant="h6" color="text.secondary">
                                Nie znaleziono żadnych zgłoszeń
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360 }}>
                                {reports.length === 0 
                                    ? 'Kliknij "Nowe zgłoszenie", żeby zgłosić problem w Twoim mieście.'
                                    : 'Spróbuj zmienić filtry lub kryteria wyszukiwania.'}
                            </Typography>
                            {reports.length === 0 && (
                                <Button
                                    variant="contained"
                                    startIcon={<AddCircleOutlineIcon />}
                                    component={RouterLink}
                                    to="/nowe-zgloszenie"
                                >
                                    Złóż pierwsze zgłoszenie
                                </Button>
                            )}
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
