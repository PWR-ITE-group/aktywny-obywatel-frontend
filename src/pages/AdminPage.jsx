import { useState, useMemo } from 'react';
import {
    Container, Box, Tabs, Tab, Paper, Stack, Typography, Button, Chip, TextField,
    Table, TableHead, TableBody, TableRow, TableCell, IconButton, Select, MenuItem,
    FormControl, InputLabel, Dialog, DialogTitle, DialogContent, DialogActions,
    Grid, Card, CardContent, InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import ReplayIcon from '@mui/icons-material/Replay';
import { MOCK_REPORTS, STATUS_COLORS, STATUS_LABELS, CATEGORIES } from '../config/mapConfig';
import toast from 'react-hot-toast';

// Panel administratora (WF-18–24).
// W prototypie operacje są lokalne — docelowo adminService.* z backendu.

const AdminPage = () => {
    const [tab, setTab] = useState(0);
    return (
        <Container maxWidth="lg" sx={{ py: 3 }}>
            <Typography variant="h5" fontWeight={700} gutterBottom>
                Panel administratora
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Zarządzaj zgłoszeniami, routingiem do wydziałów i użytkownikami.
            </Typography>

            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2, '& .MuiTab-root': { textTransform: 'none' } }}>
                <Tab label="Zgłoszenia" />
                <Tab label="Routing" />
                <Tab label="Wydziały" />
                <Tab label="Statystyki" />
                <Tab label="Użytkownicy" />
            </Tabs>

            {tab === 0 && <ReportsTab />}
            {tab === 1 && <RoutingTab />}
            {tab === 2 && <DepartmentsTab />}
            {tab === 3 && <StatsTab />}
            {tab === 4 && <UsersTab />}
        </Container>
    );
};

// --- Tab: Zgłoszenia (WF-20 status, WF-21 re-routing, WF-23 CSV) ---
const ReportsTab = () => {
    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [editDialog, setEditDialog] = useState(null);
    const [reports, setReports] = useState(MOCK_REPORTS);

    const filtered = useMemo(
        () => reports.filter((r) => {
            if (statusFilter && r.status !== statusFilter) return false;
            if (query && !r.title.toLowerCase().includes(query.toLowerCase())) return false;
            return true;
        }),
        [reports, query, statusFilter]
    );

    const exportCSV = () => {
        // WF-23: eksport zgłoszeń do CSV
        const headers = ['id', 'title', 'category', 'status', 'lat', 'lng', 'createdAt'];
        const rows = filtered.map((r) => headers.map((h) => JSON.stringify(r[h] ?? '')).join(','));
        const csv = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `zgloszenia_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success(`Wyeksportowano ${filtered.length} zgłoszeń.`);
    };

    const updateStatus = (id, newStatus) => {
        setReports((rs) => rs.map((r) => r.id === id ? { ...r, status: newStatus } : r));
        toast.success('Zmieniono status zgłoszenia.');
    };

    return (
        <Paper sx={{ p: 2 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
                <TextField
                    size="small"
                    placeholder="Szukaj…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon fontSize="small" />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ flex: 1 }}
                />
                <FormControl size="small" sx={{ minWidth: 180 }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                        value={statusFilter}
                        label="Status"
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <MenuItem value="">Wszystkie</MenuItem>
                        {Object.entries(STATUS_LABELS).map(([v, l]) => (
                            <MenuItem key={v} value={v}>{l}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={exportCSV}
                >
                    CSV
                </Button>
            </Stack>

            <Box sx={{ overflowX: 'auto' }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Tytuł</TableCell>
                            <TableCell>Kategoria</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Data</TableCell>
                            <TableCell align="right">Akcje</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filtered.map((r) => (
                            <TableRow key={r.id} hover>
                                <TableCell>{r.id}</TableCell>
                                <TableCell>{r.title}</TableCell>
                                <TableCell>{r.category}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={STATUS_LABELS[r.status]}
                                        size="small"
                                        sx={{ bgcolor: STATUS_COLORS[r.status], color: 'white' }}
                                    />
                                </TableCell>
                                <TableCell>{r.createdAt}</TableCell>
                                <TableCell align="right">
                                    <IconButton size="small" onClick={() => setEditDialog(r)} aria-label="Edytuj">
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton size="small" aria-label="Prześlij do innego wydziału" title="Re-routing">
                                        <ReplayIcon fontSize="small" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Box>

            <Dialog open={Boolean(editDialog)} onClose={() => setEditDialog(null)} maxWidth="xs" fullWidth>
                <DialogTitle>Zmień status zgłoszenia #{editDialog?.id}</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth sx={{ mt: 1 }}>
                        <InputLabel>Nowy status</InputLabel>
                        <Select
                            label="Nowy status"
                            value={editDialog?.status ?? ''}
                            onChange={(e) => setEditDialog({ ...editDialog, status: e.target.value })}
                        >
                            {Object.entries(STATUS_LABELS).map(([v, l]) => (
                                <MenuItem key={v} value={v}>{l}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Komentarz (opcjonalnie)"
                        sx={{ mt: 2 }}
                        placeholder="Powód zmiany statusu — widoczny w historii zgłoszenia."
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialog(null)}>Anuluj</Button>
                    <Button
                        variant="contained"
                        onClick={() => {
                            updateStatus(editDialog.id, editDialog.status);
                            setEditDialog(null);
                        }}
                    >
                        Zapisz
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

// --- Tab: Routing (WF-18) ---
const RoutingTab = () => {
    const [routing, setRouting] = useState(
        CATEGORIES.map((c) => ({ category: c, department: '', channel: 'api' }))
    );

    return (
        <Paper sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Konfiguracja routingu: która kategoria zgłoszenia trafia do którego wydziału
                i jakim kanałem (API / email).
            </Typography>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Kategoria</TableCell>
                        <TableCell>Wydział</TableCell>
                        <TableCell>Kanał</TableCell>
                        <TableCell align="right">Akcja</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {routing.map((row, idx) => (
                        <TableRow key={row.category}>
                            <TableCell>{row.category}</TableCell>
                            <TableCell>
                                <TextField
                                    size="small"
                                    fullWidth
                                    placeholder="np. ZDiUM"
                                    value={row.department}
                                    onChange={(e) => {
                                        const next = [...routing];
                                        next[idx] = { ...row, department: e.target.value };
                                        setRouting(next);
                                    }}
                                />
                            </TableCell>
                            <TableCell>
                                <Select
                                    size="small"
                                    value={row.channel}
                                    onChange={(e) => {
                                        const next = [...routing];
                                        next[idx] = { ...row, channel: e.target.value };
                                        setRouting(next);
                                    }}
                                >
                                    <MenuItem value="api">API (JSON)</MenuItem>
                                    <MenuItem value="email">Email</MenuItem>
                                </Select>
                            </TableCell>
                            <TableCell align="right">
                                <Button size="small" onClick={() => toast.success(`Zapisano: ${row.category}`)}>
                                    Zapisz
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Paper>
    );
};

// --- Tab: Wydziały (WF-19) ---
const DepartmentsTab = () => {
    const [departments, setDepartments] = useState([
        { id: 1, name: 'ZDiUM', email: 'zdium@um.wroc.pl', apiUrl: 'https://mock-urzad.local/zdium' },
        { id: 2, name: 'ZZM',   email: 'zzm@um.wroc.pl',   apiUrl: '' },
        { id: 3, name: 'MPWiK', email: 'mpwik@um.wroc.pl', apiUrl: 'https://mock-urzad.local/mpwik' },
    ]);
    const [dialog, setDialog] = useState(null);

    const remove = (id) => {
        setDepartments((ds) => ds.filter((d) => d.id !== id));
        toast.success('Usunięto wydział.');
    };

    return (
        <Paper sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                    Lista wydziałów, ich adresów email i endpointów API.
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setDialog({ id: null, name: '', email: '', apiUrl: '' })}
                >
                    Dodaj wydział
                </Button>
            </Stack>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Nazwa</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>API URL</TableCell>
                        <TableCell align="right">Akcje</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {departments.map((d) => (
                        <TableRow key={d.id}>
                            <TableCell>{d.name}</TableCell>
                            <TableCell>{d.email}</TableCell>
                            <TableCell sx={{ maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {d.apiUrl || <i style={{ color: '#9CA3AF' }}>brak — użyje email</i>}
                            </TableCell>
                            <TableCell align="right">
                                <IconButton size="small" onClick={() => setDialog(d)}>
                                    <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton size="small" onClick={() => remove(d.id)} color="error">
                                    <DeleteOutlineIcon fontSize="small" />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <Dialog open={Boolean(dialog)} onClose={() => setDialog(null)} maxWidth="sm" fullWidth>
                <DialogTitle>{dialog?.id ? 'Edytuj wydział' : 'Dodaj wydział'}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField
                            label="Nazwa"
                            value={dialog?.name ?? ''}
                            onChange={(e) => setDialog({ ...dialog, name: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label="Email"
                            value={dialog?.email ?? ''}
                            onChange={(e) => setDialog({ ...dialog, email: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label="API URL (opcjonalnie)"
                            helperText="Jeśli puste, zgłoszenie trafi tylko emailem (fallback WF-26)."
                            value={dialog?.apiUrl ?? ''}
                            onChange={(e) => setDialog({ ...dialog, apiUrl: e.target.value })}
                            fullWidth
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialog(null)}>Anuluj</Button>
                    <Button
                        variant="contained"
                        onClick={() => {
                            if (dialog.id) {
                                setDepartments((ds) => ds.map((d) => d.id === dialog.id ? dialog : d));
                            } else {
                                setDepartments((ds) => [...ds, { ...dialog, id: Date.now() }]);
                            }
                            toast.success('Zapisano.');
                            setDialog(null);
                        }}
                    >
                        Zapisz
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

// --- Tab: Statystyki (WF-22) ---
const StatsTab = () => {
    const total = MOCK_REPORTS.length;
    const byStatus = useMemo(() => {
        const acc = {};
        for (const r of MOCK_REPORTS) acc[r.status] = (acc[r.status] ?? 0) + 1;
        return acc;
    }, []);
    const byCategory = useMemo(() => {
        const acc = {};
        for (const r of MOCK_REPORTS) acc[r.category] = (acc[r.category] ?? 0) + 1;
        return acc;
    }, []);

    return (
        <Stack spacing={2}>
            <Grid container spacing={2}>
                <StatCard label="Wszystkie zgłoszenia" value={total} />
                <StatCard label="W realizacji" value={byStatus['w realizacji'] ?? 0} />
                <StatCard label="Zakończone" value={byStatus['zakończone'] ?? 0} />
                <StatCard label="Odrzucone" value={byStatus['odrzucone'] ?? 0} color="error.main" />
            </Grid>

            <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                    Podział wg statusu
                </Typography>
                <BarList data={byStatus} colorBy={(k) => STATUS_COLORS[k]} labelBy={(k) => STATUS_LABELS[k]} />
            </Paper>

            <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                    Podział wg kategorii
                </Typography>
                <BarList data={byCategory} colorBy={() => '#5B5FED'} />
            </Paper>
        </Stack>
    );
};

const StatCard = ({ label, value, color = 'primary.main' }) => (
    <Grid item xs={6} md={3}>
        <Card>
            <CardContent>
                <Typography variant="caption" color="text.secondary">
                    {label}
                </Typography>
                <Typography variant="h4" fontWeight={700} color={color}>
                    {value}
                </Typography>
            </CardContent>
        </Card>
    </Grid>
);

// Prościutki poziomy "bar chart" — bez dodatkowych zależności
const BarList = ({ data, colorBy, labelBy }) => {
    const max = Math.max(...Object.values(data), 1);
    return (
        <Stack spacing={1}>
            {Object.entries(data).map(([key, value]) => (
                <Box key={key}>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.25 }}>
                        <Typography variant="caption">{labelBy ? labelBy(key) : key}</Typography>
                        <Typography variant="caption" color="text.secondary">{value}</Typography>
                    </Stack>
                    <Box
                        sx={{
                            height: 8,
                            borderRadius: 1,
                            bgcolor: 'grey.100',
                            overflow: 'hidden',
                        }}
                    >
                        <Box
                            sx={{
                                height: '100%',
                                width: `${(value / max) * 100}%`,
                                bgcolor: colorBy(key),
                            }}
                        />
                    </Box>
                </Box>
            ))}
        </Stack>
    );
};

// --- Tab: Użytkownicy (WF-24) ---
const UsersTab = () => {
    const [users, setUsers] = useState([
        { id: 1, email: 'jan.kowalski@example.com', createdAt: '2026-01-15', reports: 3 },
        { id: 2, email: 'anna.nowak@example.com', createdAt: '2026-02-08', reports: 0 },
        { id: 3, email: 'piotr.wojcik@example.com', createdAt: '2026-03-22', reports: 7 },
    ]);

    const removeUser = (id) => {
        setUsers((us) => us.filter((u) => u.id !== id));
        toast.success('Konto użytkownika usunięte.');
    };

    return (
        <Paper sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Lista kont mieszkańców. Usunięcie konta zgodnie z WF-24 usuwa również zgłoszenia
                zgodnie z polityką RODO.
            </Typography>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Zarejestrowany</TableCell>
                        <TableCell>Zgłoszenia</TableCell>
                        <TableCell align="right">Akcje</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {users.map((u) => (
                        <TableRow key={u.id} hover>
                            <TableCell>{u.id}</TableCell>
                            <TableCell>{u.email}</TableCell>
                            <TableCell>{u.createdAt}</TableCell>
                            <TableCell>{u.reports}</TableCell>
                            <TableCell align="right">
                                <IconButton size="small" color="error" onClick={() => removeUser(u.id)}>
                                    <DeleteOutlineIcon fontSize="small" />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Paper>
    );
};

export default AdminPage;
