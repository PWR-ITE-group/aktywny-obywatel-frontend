import { Card, CardContent, Box, Typography, Chip, Stack, Grid, CardActionArea } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CancelIcon from '@mui/icons-material/Cancel';
import ArchiveIcon from '@mui/icons-material/Archive';
import { STATUS_COLORS, STATUS_LABELS } from '../../config/mapConfig';
import { useNavigate } from 'react-router-dom';
import { BACKEND_CATEGORY_TO_LABEL } from '../../config/reportCategories';

// Ikona + kolor wiodący dla statusu
const statusMeta = (status) => {
    switch (status) {
        case 'RESOLVED':     return { icon: <CheckCircleIcon fontSize="small" />, label: 'Rozwiązane', color: 'success.main' };
        case 'ROUTED':       return { icon: <HourglassEmptyIcon fontSize="small" />, label: 'Przekazane do urzędu', color: 'info.main' };
        case 'IN_PROGRESS':  return { icon: <HourglassEmptyIcon fontSize="small" />, label: 'W realizacji',     color: 'info.main' };
        case 'NEW':          return { icon: <AccessTimeIcon fontSize="small" />,    label: 'Zgłoszone',          color: 'warning.main' };
        case 'REJECTED':     return { icon: <CancelIcon fontSize="small" />,        label: 'Odrzucone',         color: 'error.main' };
        case 'ARCHIVED':     return { icon: <ArchiveIcon fontSize="small" />,        label: 'Zarchiwizowane',    color: 'text.secondary' };
        default:             return { icon: <AccessTimeIcon fontSize="small" />,    label: STATUS_LABELS[status] ?? status, color: 'text.secondary' };
    }
};

// Karta zgłoszenia z widokiem odpowiedzi urzędu, zdjęciami i datą.
const ReportStatusCard = ({ report }) => {
    const meta = statusMeta(report.status);
    const navigate = useNavigate();

    return (
        <Card sx={{ mb: 2, borderLeft: report.urgent ? '6px solid #ef4444' : 'none', position: 'relative' }}>
            <CardActionArea onClick={() => navigate(`/zgloszenie/${report.id}`)}>
                <CardContent sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        {/* Nagłówek autora odpowiedzi */}
                        <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ mb: 1 }}>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="subtitle2" fontWeight={700}>
                                    {report.assignedDepartment ?? report.authorityName ?? 'System Centralny Aktywny Obywatel'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Wydział obsługujący sprawę
                                </Typography>
                            </Box>
                        </Stack>

                        {/* Status badge */}
                        <Stack
                            direction="row"
                            alignItems="center"
                            spacing={0.75}
                            sx={{
                                bgcolor: 'rgba(22, 163, 74, 0.08)',
                                color: meta.color,
                                px: 1.25, py: 0.5,
                                borderRadius: 999,
                                width: 'fit-content',
                                mb: 1.5,
                            }}
                        >
                            {meta.icon}
                            <Typography variant="caption" fontWeight={600}>
                                {meta.label}
                            </Typography>
                        </Stack>

                        {/* Treść odpowiedzi / opis */}
                        <Typography variant="body2" sx={{ mb: 1.5, whiteSpace: 'pre-wrap' }}>
                            {report.response ?? report.description ?? 'Brak odpowiedzi.'}
                        </Typography>

                        {/* Kategoria + lokalizacja */}
                        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 1 }}>
                            {report.urgent && (
                                <Chip label="PILNE" size="small" color="error" sx={{ fontWeight: 800 }} />
                            )}
                            <Chip label={BACKEND_CATEGORY_TO_LABEL[report.category] ?? report.category} size="small" variant="outlined" />
                            {(report.address?.displayName || report.location) && (
                                <Chip
                                    label={report.address?.displayName || report.location}
                                    size="small"
                                    variant="outlined"
                                    sx={{ maxWidth: 240 }}
                                />
                            )}
                        </Stack>

                        {/* Siatka miniatur zdjęć (jak na screenie 5) */}
                        {report.photos?.length > 0 && (
                            <Grid container spacing={0.5} sx={{ my: 1 }}>
                                {report.photos.slice(0, 4).map((url, i) => (
                                    <Grid item xs={6} key={i}>
                                        <Box
                                            sx={{
                                                position: 'relative',
                                                width: '100%',
                                                pt: '60%',
                                                bgcolor: 'grey.100',
                                                borderRadius: 1.5,
                                                overflow: 'hidden',
                                                backgroundImage: `url(${url})`,
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center',
                                            }}
                                        >
                                            {/* Licznik dodatkowych zdjęć na ostatnim kafelku */}
                                            {i === 3 && report.photos.length > 4 && (
                                                <Box
                                                    sx={{
                                                        position: 'absolute', inset: 0,
                                                        bgcolor: 'rgba(17,24,39,0.55)',
                                                        color: 'white',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontWeight: 600,
                                                        fontSize: '0.875rem',
                                                    }}
                                                >
                                                    jeszcze {report.photos.length - 4}
                                                </Box>
                                            )}
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>
                        )}

                        {/* Stopka — data publikacji */}
                        <Typography variant="caption" color="text.secondary" display="block">
                            Opublikowano {report.publishedAt ?? report.createdAt}
                        </Typography>
                        {report.status === 'zakończone' && (
                            <Typography variant="caption" color="success.main" display="block">
                                Odpowiedź została udzielona w wyznaczonym czasie.
                            </Typography>
                        )}
                    </Box>

                    {/* Główne zdjęcie zgłoszenia na boku */}
                    {report.firstAttachmentId && (
                        <Box sx={{ width: 100, height: 100, flexShrink: 0, borderRadius: 1.5, overflow: 'hidden', bgcolor: 'grey.100' }}>
                            <Box
                                component="img"
                                src={`${import.meta.env.VITE_API_URL || ''}/api/complaints/attachments/${report.firstAttachmentId}/download`}
                                alt="Pierwsze zdjęcie zgłoszenia"
                                sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                            />
                        </Box>
                    )}
                </CardContent>
            </CardActionArea>
        </Card>
    );
};

export default ReportStatusCard;
