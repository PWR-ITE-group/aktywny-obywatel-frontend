import { useState, useMemo, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
    Container, Box, Typography, Tabs, Tab, Button, Card, CardContent, Stack, CircularProgress, Alert,
    TextField, FormControl, InputLabel, Select, MenuItem, Avatar, Grid, Divider, Chip
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import SettingsIcon from '@mui/icons-material/Settings';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
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
                const data = await complaintService.getUserReports(user?.id, 0, 50);
                setReports(data.content || []);
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
            result = result.filter((r) => r.status !== 'RESOLVED' && r.status !== 'zakończone' && r.status !== 'odrzucone' && r.status !== 'ARCHIVED');
        } else if (tab === 'done') {
            result = result.filter((r) => r.status === 'RESOLVED' || r.status === 'zakończone' || r.status === 'ARCHIVED');
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
            {/* Karta Profilu Użytkownika */}
            <Card variant="outlined" sx={{ mb: 4, background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)', position: 'relative' }}>
                <CardContent sx={{ p: 3 }}>
                    <Grid container spacing={3} alignItems="center">
                        {/* Avatar */}
                        <Grid item>
                            <Avatar 
                                sx={{ 
                                    width: 72, 
                                    height: 72, 
                                    bgcolor: 'primary.main', 
                                    color: 'white',
                                    fontSize: 28, 
                                    fontWeight: 700,
                                    boxShadow: '0 4px 10px rgba(91, 95, 237, 0.25)'
                                }}
                            >
                                {user?.firstName && user?.lastName 
                                    ? `${user.firstName[0].toUpperCase()}${user.lastName[0].toUpperCase()}`
                                    : (user?.email?.[0]?.toUpperCase() || 'U')}
                            </Avatar>
                        </Grid>

                        {/* Dane użytkownika */}
                        <Grid item xs={12} sm>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
                                <Typography variant="h5" fontWeight={700}>
                                    {user?.firstName && user?.lastName 
                                        ? `${user.firstName} ${user.lastName}` 
                                        : 'Mieszkaniec'}
                                </Typography>
                                {user?.isVerified || user?.verified ? (
                                    <Chip 
                                        icon={<CheckCircleIcon fontSize="small" sx={{ color: 'success.main !important' }} />} 
                                        label="Konto Zweryfikowane" 
                                        size="small" 
                                        color="success" 
                                        variant="outlined"
                                        sx={{ bgcolor: 'rgba(22, 163, 74, 0.05)', fontWeight: 600 }}
                                    />
                                ) : (
                                    <Chip 
                                        icon={<HelpOutlineIcon fontSize="small" sx={{ color: 'warning.main !important' }} />} 
                                        label="Niezweryfikowany" 
                                        size="small" 
                                        color="warning" 
                                        variant="outlined"
                                        sx={{ bgcolor: 'rgba(245, 158, 11, 0.05)', fontWeight: 600 }}
                                    />
                                )}
                                {user?.isAdmin && (
                                    <Chip 
                                        label="Administrator" 
                                        size="small" 
                                        color="secondary" 
                                        sx={{ fontWeight: 600 }}
                                    />
                                )}
                            </Box>
                            
                            <Stack spacing={0.5} sx={{ mt: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                                    <EmailIcon fontSize="small" />
                                    <Typography variant="body2">{user?.email}</Typography>
                                </Box>
                                {(user?.phone || user?.phoneNumber) && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                                        <PhoneIcon fontSize="small" />
                                        <Typography variant="body2">{user?.phone || user?.phoneNumber}</Typography>
                                    </Box>
                                )}
                            </Stack>
                        </Grid>

                    </Grid>

                    <Divider sx={{ my: 2.5 }} />

                    {/* Statystyki Zgłoszeń */}
                    <Grid container spacing={2}>
                        <Grid item xs={4}>
                            <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: '#f4f5f7', borderRadius: 3 }}>
                                <Typography variant="caption" color="text.secondary" display="block" fontWeight={500}>
                                    Wszystkie zgłoszenia
                                </Typography>
                                <Typography variant="h6" fontWeight={700} color="primary.main">
                                    {reports.length}
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={4}>
                            <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: 'rgba(245, 158, 11, 0.05)', borderRadius: 3, border: '1px solid rgba(245, 158, 11, 0.1)' }}>
                                <Typography variant="caption" color="warning.main" display="block" fontWeight={500}>
                                    W realizacji / Nowe
                                </Typography>
                                <Typography variant="h6" fontWeight={700} color="warning.main">
                                    {reports.filter(r => r.status === 'NEW' || r.status === 'ROUTED' || r.status === 'IN_PROGRESS').length}
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={4}>
                            <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: 'rgba(22, 163, 74, 0.05)', borderRadius: 3, border: '1px solid rgba(22, 163, 74, 0.1)' }}>
                                <Typography variant="caption" color="success.main" display="block" fontWeight={500}>
                                    Rozwiązane / Zakończone
                                </Typography>
                                <Typography variant="h6" fontWeight={700} color="success.main">
                                    {reports.filter(r => r.status === 'RESOLVED' || r.status === 'ARCHIVED').length}
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                    gap: 1,
                }}
            >
                <Typography variant="h5" fontWeight={700}>
                    Moje zgłoszenia
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddCircleOutlineIcon />}
                    component={RouterLink}
                    to="/nowe-zgloszenie"
                    sx={{ flexShrink: 0 }}
                >
                    Nowe zgłoszenie
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
