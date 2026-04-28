import { Card, CardContent, Box, Typography, Chip, Stack, Grid } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CancelIcon from '@mui/icons-material/Cancel';
import { STATUS_COLORS, STATUS_LABELS } from '../../config/mapConfig';

// Ikona + kolor wiodący dla statusu (jak zielony check "Problem naprawiony" na screenie 5).
const statusMeta = (status) => {
    switch (status) {
        case 'zakończone':   return { icon: <CheckCircleIcon fontSize="small" />, label: 'Problem naprawiony', color: 'success.main' };
        case 'w realizacji': return { icon: <HourglassEmptyIcon fontSize="small" />, label: 'W realizacji',     color: 'info.main' };
        case 'przyjęte':     return { icon: <AccessTimeIcon fontSize="small" />,    label: 'Przyjęte',          color: 'warning.main' };
        case 'odrzucone':    return { icon: <CancelIcon fontSize="small" />,        label: 'Odrzucone',         color: 'error.main' };
        default:             return { icon: <AccessTimeIcon fontSize="small" />,    label: STATUS_LABELS[status] ?? status, color: 'text.secondary' };
    }
};

// Karta zgłoszenia z widokiem odpowiedzi urzędu, zdjęciami i datą.
const ReportStatusCard = ({ report }) => {
    const meta = statusMeta(report.status);

    return (
        <Card sx={{ mb: 2 }}>
            <CardContent sx={{ p: 2 }}>
                {/* Nagłówek autora odpowiedzi */}
                <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ mb: 1 }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle2" fontWeight={700}>
                            {report.authorityName ?? 'Urząd Miejski Wrocławia'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {report.authorityRole ?? 'Wydział odpowiedzialny za zgłoszenia'}
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
                    <Chip label={report.category} size="small" variant="outlined" />
                    {report.location && (
                        <Chip
                            label={report.location}
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
            </CardContent>
        </Card>
    );
};

export default ReportStatusCard;
