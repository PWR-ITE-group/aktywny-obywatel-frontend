import { useEffect, useState } from 'react';
import { Box, Stack, Typography, Chip, Grid, Divider, Alert } from '@mui/material';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { createColoredIcon } from '../../utils/leafletIcons';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';

const StepConfirm = ({ formData }) => {
    // POPRAWKA: Wyciągamy categoryLabel oraz title zamiast nieistniejącego category
    const { categoryLabel, title, description, photos, location, urgent } = formData;
    const [previews, setPreviews] = useState([]);

    useEffect(() => {
        if (!photos || photos.length === 0) {
            setPreviews([]);
            return;
        }

        const urls = photos.map((p) => (p instanceof File ? URL.createObjectURL(p) : p.url));
        setPreviews(urls);
        return () => urls.forEach((u) => u?.startsWith('blob:') && URL.revokeObjectURL(u));
    }, [photos]);

    return (
        <Stack spacing={2.5}>
            <Alert severity="info" icon={false}>
                Sprawdź dane przed złożeniem zgłoszenia. Po wysłaniu zostanie ono przekazane
                do właściwej jednostki Urzędu Miejskiego Wrocławia.
            </Alert>

            {/* POPRAWKA: Renderowanie grupy kategorii oraz szczegółowego tematu */}
            <Section label="Kategoria / temat">
                {categoryLabel || title ? (
                    <Stack direction="column" spacing={1} alignItems="flex-start">
                        {categoryLabel && <Chip label={categoryLabel} color="primary" variant="combined" sx={{ fontWeight: 600 }} />}
                        {title && <Typography variant="body2" fontWeight={500} color="text.primary" sx={{ mt: 0.5 }}>{title}</Typography>}
                    </Stack>
                ) : (
                    <Typography color="error" variant="body2">Nie wybrano</Typography>
                )}
            </Section>

            <Section label="Opis">
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {description?.trim() || <i style={{ color: '#9CA3AF' }}>— brak opisu —</i>}
                </Typography>
            </Section>

            {urgent && (
                <Section label="Priorytet">
                    <Alert severity="error" icon={<PriorityHighIcon />}>
                        Zgłoszenie zostało oznaczone jako pilne.
                    </Alert>
                </Section>
            )}

            <Section label={`Zdjęcia (${previews.length})`}>
                {previews.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                        Nie dodano zdjęć.
                    </Typography>
                ) : (
                    <Grid container spacing={1}>
                        {previews.map((url, i) => (
                            <Grid item xs={4} key={i}>
                                <Box sx={{ width: '100%', height: 100, borderRadius: 1.5, overflow: 'hidden', bgcolor: 'grey.100' }}>
                                    <Box
                                        component="img"
                                        src={url}
                                        alt={`Zdjęcie ${i + 1}`}
                                        sx={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            display: 'block'
                                        }}
                                    />
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Section>

            <Section label="Lokalizacja">
                {location ? (
                    <>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            {location[0].toFixed(5)}, {location[1].toFixed(5)}
                        </Typography>
                        <Box sx={{ height: 220, borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                            <MapContainer
                                center={location}
                                zoom={16}
                                style={{ height: '100%', width: '100%' }}
                                dragging={false}
                                zoomControl={false}
                                scrollWheelZoom={false}
                                doubleClickZoom={false}
                            >
                                <TileLayer
                                    attribution='&copy; OpenStreetMap'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <Marker position={location} icon={createColoredIcon('#5B5FED')} />
                            </MapContainer>
                        </Box>
                    </>
                ) : (
                    <Typography variant="body2" color="error">Brak lokalizacji</Typography>
                )}
            </Section>
        </Stack>
    );
};

const Section = ({ label, children }) => (
    <Box>
        <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: '0.08em' }}>
            {label}
        </Typography>
        <Divider sx={{ mb: 1 }} />
        {children}
    </Box>
);

export default StepConfirm;