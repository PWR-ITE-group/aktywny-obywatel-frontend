import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
    Container, Box, Stack, Typography, Chip, Paper, Grid, Button, AppBar, Toolbar, IconButton,
    Divider, Dialog
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
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import { MOCK_REPORTS, STATUS_COLORS, STATUS_LABELS } from '../config/mapConfig';
import { createColoredIcon } from '../utils/leafletIcons';
import { complaintService } from '../services/complaintService';
import { adminService } from '../services/adminService';
import { useAuth } from '../context/AuthContext';
import { BACKEND_CATEGORY_TO_LABEL } from '../config/reportCategories';

// WF-16: pełna historia zgłoszenia. WF-04 dla gościa — bez danych zgłaszającego.

// Pełny przebieg statusów (WF-28: każda zmiana loguje poprzedni status + timestamp).
const STATUS_STEPS = ['złożone', 'przyjęte', 'w realizacji', 'zakończone'];

const statusIcon = (status) => {
    switch (status) {
        case 'RESOLVED':   return <CheckCircleIcon />;
        case 'ROUTED':
        case 'IN_PROGRESS': return <HourglassEmptyIcon />;
        case 'ARCHIVED':   return <CancelIcon />;
        case 'NEW':        return <SendIcon />;
        default:           return <AccessTimeIcon />;
    }
};

// Prototyp — generujemy mockowaną historię na podstawie statusu końcowego
const buildHistory = (report) => {
    if (report.history && Array.isArray(report.history) && report.history.length > 0) {
        return [...report.history].reverse().map(h => ({
            status: h.newStatus,
            at: new Date(h.createdAt).toLocaleString('pl-PL'),
            comment: h.comment || (h.source === 'SYSTEM' ? 'Aktualizacja systemowa' : ''),
            source: h.source
        }));
    }

    const base = new Date(report.createdAt);
    const addDays = (d) => { const x = new Date(base); x.setDate(x.getDate() + d); return x.toLocaleDateString('pl-PL'); };

    const entries = [{ status: 'NEW', at: addDays(0), comment: 'Zgłoszenie przyjęte przez system.' }];
    if (report.status === 'ARCHIVED') {
        entries.push({ status: 'ARCHIVED', at: addDays(2), comment: 'Zgłoszenie zostało zarchiwizowane.' });
        return entries;
    }
    return entries;
};

const ReportDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [report, setReport] = useState(null);
    const [attachments, setAttachments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        let mounted = true;
        const fetchReport = async () => {
            try {
                let data;
                if (user?.isAdmin) {
                    const response = await adminService.getReportById(id);
                    data = { ...response.complaint, author: response.author };
                } else {
                    data = await complaintService.getById(id);
                }
                
                if (!mounted) return;
                setReport(data);
                
                // Increment view count exactly once when opening the page
                complaintService.incrementView(id).catch(err => console.error("Failed to increment view", err));

                try {
                    const attData = await complaintService.getAttachments(id);
                    if (mounted) setAttachments(attData || []);
                } catch (err) {
                    console.error("Failed to fetch attachments:", err);
                    if (mounted) setAttachments([]);
                }
            } catch (err) {
                console.error("Failed to fetch report detail:", err);
                if (mounted) setError(true);
            } finally {
                if (mounted) setLoading(false);
            }
        };
        fetchReport();
        return () => { mounted = false; };
    }, [id, user?.isAdmin]);

    if (loading) {
        return (
            <Container sx={{ py: 4 }}>
                <Typography variant="h6">Ładowanie...</Typography>
            </Container>
        );
    }

    if (error || !report) {
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
                            <Chip label={BACKEND_CATEGORY_TO_LABEL[report.category] ?? report.category} size="small" />
                            {report.assignedDepartment && (
                                <Chip 
                                    label={report.assignedDepartment} 
                                    size="small" 
                                    variant="outlined" 
                                    color="primary" 
                                />
                            )}
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
                        {report.author && (
                            <Typography variant="body2" color="primary.main" fontWeight={500} sx={{ mb: 1 }}>
                                Zgłaszający: {report.author.firstName} ({report.author.email})
                            </Typography>
                        )}
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                            Zgłoszono: {new Date(report.createdAt).toLocaleString()}
                            <span style={{ margin: '0 4px' }}>•</span>
                            <VisibilityIcon fontSize="small" /> {report.viewCount || 0}
                        </Typography>
                        <Divider sx={{ my: 1.5 }} />
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                            {report.description}
                        </Typography>

                        {attachments && attachments.length > 0 && (
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                                    Załączone zdjęcia
                                </Typography>
                                <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 1 }}>
                                    {attachments.map((att) => (
                                        <Box
                                            key={att.id}
                                            component="img"
                                            src={`/api/complaints/attachments/${att.id}/download`}
                                            alt="Załącznik"
                                            onClick={() => setSelectedImage(`/api/complaints/attachments/${att.id}/download`)}
                                            sx={{
                                                height: 120,
                                                borderRadius: 1,
                                                objectFit: 'cover',
                                                border: '1px solid',
                                                borderColor: 'divider',
                                                cursor: 'pointer',
                                            }}
                                        />
                                    ))}
                                </Stack>
                            </Box>
                        )}
                    </Paper>

                    {/* Mapa z lokalizacją */}
                    <Paper sx={{ overflow: 'hidden' }}>
                        <Box sx={{ px: 2, pt: 2 }}>
                            <Typography variant="subtitle2" fontWeight={700}>
                                Lokalizacja
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {report.address?.street ? `${report.address.street} ${report.address.houseNumber || ''}`.trim() : (report.address?.displayName || 'Brak adresu')} ({report.address?.latitude?.toFixed(5) ?? report.lat?.toFixed(5)}, {report.address?.longitude?.toFixed(5) ?? report.lng?.toFixed(5)})
                            </Typography>
                        </Box>
                        <Box sx={{ height: 260, mt: 1 }}>
                            <MapContainer
                                center={[report.address?.latitude ?? report.lat, report.address?.longitude ?? report.lng]}
                                zoom={16}
                                style={{ height: '100%', width: '100%' }}
                                scrollWheelZoom={false}
                            >
                                <TileLayer
                                    attribution='&copy; OpenStreetMap'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <Marker
                                    position={[report.address?.latitude ?? report.lat, report.address?.longitude ?? report.lng]}
                                    icon={createColoredIcon(STATUS_COLORS[report.status] || '#757575')}
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
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                            {h.comment}
                                        </Typography>
                                        {h.status === 'ARCHIVED' && h.source && h.source.includes('@') && (
                                            <Typography variant="caption" color="error.main" sx={{ display: 'block', mt: 0.5, fontWeight: 500 }}>
                                                Jeśli uważasz, że to zgłoszenie zostało zarchiwizowane przez pomyłkę, skontaktuj się z naszym administratorem: {h.source}
                                            </Typography>
                                        )}
                                    </TimelineContent>
                                </TimelineItem>
                            ))}
                        </Timeline>
                    </Paper>
                </Stack>
            </Container>

            {/* Modal ze zdjęciem */}
            <Dialog open={!!selectedImage} onClose={() => setSelectedImage(null)} maxWidth="md">
                <Box sx={{ position: 'relative' }}>
                    <IconButton
                        onClick={() => setSelectedImage(null)}
                        sx={{ position: 'absolute', right: 8, top: 8, bgcolor: 'rgba(0,0,0,0.5)', color: 'white', '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }, zIndex: 1 }}
                    >
                        <CloseIcon />
                    </IconButton>
                    <Box component="img" src={selectedImage} sx={{ width: '100%', height: 'auto', display: 'block', maxHeight: '90vh', objectFit: 'contain' }} />
                </Box>
            </Dialog>
        </Box>
    );
};

export default ReportDetailPage;
