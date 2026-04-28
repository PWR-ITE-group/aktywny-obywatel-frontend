
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
    Container, Box, Stack, Typography, Chip, Paper, Grid, Button, AppBar, Toolbar, IconButton,
    Divider,
} from '@mui/material';
import {
    Timeline, TimelineItem, TimelineSeparator, TimelineDot, TimelineConnector, TimelineContent, TimelineOppositeContent,
} from '@mui/lab';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CancelIcon from '@mui/icons-material/Cancel';
import SendIcon from '@mui/icons-material/Send';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import { MOCK_REPORTS, STATUS_COLORS, STATUS_LABELS } from '../config/mapConfig';
import { createColoredIcon } from '../utils/leafletIcons';

// WF-16: pełna historia zgłoszenia. WF-04 dla gościa — bez danych zgłaszającego.

// Pełny przebieg statusów (WF-28: każda zmiana loguje poprzedni status + timestamp).
const STATUS_STEPS = ['złożone', 'przyjęte', 'w realizacji', 'zakończone'];

const statusIcon = (status) => {
    switch (status) {
        case 'zakończone':   return <CheckCircleIcon />;
        case 'w realizacji': return <HourglassEmptyIcon />;
        case 'odrzucone':    return <CancelIcon />;
        case 'przyjęte':     return <AccessTimeIcon />;
        default:             return <SendIcon />;
    }
};

// Prototyp — generujemy mockowaną historię na podstawie statusu końcowego
const buildHistory = (report) => {
    const base = new Date(report.createdAt);
    const addDays = (d) => { const x = new Date(base); x.setDate(x.getDate() + d); return x.toLocaleDateString('pl-PL'); };

    const entries = [{ status: 'złożone', at: addDays(0), comment: 'Zgłoszenie przyjęte przez system.' }];
    if (report.status === 'odrzucone') {
        entries.push({ status: 'odrzucone', at: addDays(2), comment: 'Zgłoszenie poza zakresem obsługi.' });
        return entries;
    }
    const endIdx = STATUS_STEPS.indexOf(report.status);
    for (let i = 1; i <= endIdx; i++) {
        entries.push({
            status: STATUS_STEPS[i],
            at: addDays(i * 3),
            comment: {
                'przyjęte': 'Zgłoszenie przekazane do właściwego wydziału.',
                'w realizacji': 'Rozpoczęto prace w terenie.',
                'zakończone': 'Problem został rozwiązany.',
            }[STATUS_STEPS[i]],
        });
    }
    return entries;
};

const ReportDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const report = MOCK_REPORTS.find((r) => String(r.id) === String(id));

    if (!report) {
        return (
            <Container sx={{ py: 4 }}>
                <Typography variant="h6">Nie znaleziono zgłoszenia.</Typography>
                <Button component={RouterLink} to="/mapa" sx={{ mt: 2 }}>
                    Wróć do mapy
                </Button>
            </Container>
        );
    }

    const history = buildHistory(report);

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
            <AppBar position="sticky" color="inherit" elevation={0}>
                <Toolbar>
                    <IconButton edge="start" onClick={() => navigate(-1)}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="subtitle1" fontWeight={600} sx={{ flex: 1 }}>
                        Zgłoszenie #{report.id}
                    </Typography>
                </Toolbar>
            </AppBar>

            <Container maxWidth="md" sx={{ py: 3 }}>
                <Stack spacing={2}>
                    <Paper sx={{ p: 2.5 }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }} flexWrap="wrap">
                            <Chip label={report.category} size="small" />
                            <Chip
                                label={STATUS_LABELS[report.status]}
                                size="small"
                                sx={{
                                    bgcolor: STATUS_COLORS[report.status],
                                    color: 'white',
                                    fontWeight: 600,
                                }}
                            />
                        </Stack>
                        <Typography variant="h5" fontWeight={700} gutterBottom>
                            {report.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                            Zgłoszono: {report.createdAt}
                        </Typography>
                        <Divider sx={{ my: 1.5 }} />
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                            {report.description}
                        </Typography>
                    </Paper>

                    {/* Mapa z lokalizacją */}
                    <Paper sx={{ overflow: 'hidden' }}>
                        <Box sx={{ px: 2, pt: 2 }}>
                            <Typography variant="subtitle2" fontWeight={700}>
                                Lokalizacja
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {report.lat.toFixed(5)}, {report.lng.toFixed(5)}
                            </Typography>
                        </Box>
                        <Box sx={{ height: 260, mt: 1 }}>
                            <MapContainer
                                center={[report.lat, report.lng]}
                                zoom={16}
                                style={{ height: '100%', width: '100%' }}
                                scrollWheelZoom={false}
                            >
                                <TileLayer
                                    attribution='&copy; OpenStreetMap'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <Marker
                                    position={[report.lat, report.lng]}
                                    icon={createColoredIcon(STATUS_COLORS[report.status])}
                                />
                            </MapContainer>
                        </Box>
                    </Paper>

                    {/* Historia statusów — WF-16 + WF-28 */}
                    <Paper sx={{ p: 2.5 }}>
                        <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                            Historia zgłoszenia
                        </Typography>
                        <Timeline sx={{ p: 0, m: 0, [`& .MuiTimelineItem-root:before`]: { flex: 0.2 } }}>
                            {history.map((h, i) => (
                                <TimelineItem key={i}>
                                    <TimelineOppositeContent sx={{ py: 1.5 }}>
                                        <Typography variant="caption" color="text.secondary">
                                            {h.at}
                                        </Typography>
                                    </TimelineOppositeContent>
                                    <TimelineSeparator>
                                        <TimelineDot sx={{ bgcolor: STATUS_COLORS[h.status] }}>
                                            {statusIcon(h.status)}
                                        </TimelineDot>
                                        {i < history.length - 1 && <TimelineConnector />}
                                    </TimelineSeparator>
                                    <TimelineContent sx={{ py: 1.5 }}>
                                        <Typography variant="body2" fontWeight={600}>
                                            {STATUS_LABELS[h.status]}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {h.comment}
                                        </Typography>
                                    </TimelineContent>
                                </TimelineItem>
                            ))}
                        </Timeline>
                    </Paper>
                </Stack>
            </Container>
        </Box>
    );
};

export default ReportDetailPage;
