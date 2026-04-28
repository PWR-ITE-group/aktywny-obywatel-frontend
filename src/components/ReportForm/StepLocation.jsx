import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import {
    Box, Stack, Typography, Button, TextField, IconButton, Alert, CircularProgress,
    InputAdornment, List, ListItemButton, ListItemText, Paper,
} from '@mui/material';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import 'leaflet/dist/leaflet.css';
import { WROCLAW_CENTER, DEFAULT_ZOOM } from '../../config/mapConfig';
import { createColoredIcon } from '../../utils/leafletIcons';

// WF-11: mieszkaniec podaje lokalizację albo koryguje automatyczną.
// Mapa OSM (WF zgodny z E2 5.1 — OpenStreetMap).

// Nominatim — darmowy geocoder OSM. W produkcji użyj własnego proxy
// albo trzymaj się limitu 1 req/s (zgodnie z regulaminem).
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org';
const NOMINATIM_HEADERS = { 'Accept-Language': 'pl' };

// Helper — pozwala kliknąć na mapę żeby postawić/przesunąć pinezkę
const ClickCapture = ({ onPick }) => {
    useMapEvents({
        click(e) {
            onPick([e.latlng.lat, e.latlng.lng]);
        },
    });
    return null;
};

// Pomocniczy komponent — przesuwa widok mapy na wybraną lokalizację
const Recenter = ({ location }) => {
    const map = useMap();
    useEffect(() => {
        if (location) {
            map.setView(location, Math.max(map.getZoom(), 16));
        }
    }, [location, map]);
    return null;
};

const StepLocation = ({ location, onChange }) => {
    const [search, setSearch] = useState('');
    const [results, setResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [geoError, setGeoError] = useState(null);
    const [address, setAddress] = useState(null);

    // Reverse geocoding — pokazujemy czytelny adres pod mapą
    useEffect(() => {
        if (!location) { setAddress(null); return; }
        const [lat, lng] = location;
        const ctrl = new AbortController();
        fetch(
            `${NOMINATIM_URL}/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=pl`,
            { headers: NOMINATIM_HEADERS, signal: ctrl.signal }
        )
            .then((r) => r.ok ? r.json() : null)
            .then((data) => setAddress(data?.display_name ?? null))
            .catch(() => { /* fetch abort / offline */ });
        return () => ctrl.abort();
    }, [location]);

    const useMyLocation = () => {
        if (!navigator.geolocation) {
            setGeoError('Twoja przeglądarka nie wspiera geolokalizacji.');
            return;
        }
        setGeoError(null);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                onChange([pos.coords.latitude, pos.coords.longitude]);
            },
            (err) => {
                setGeoError(
                    err.code === err.PERMISSION_DENIED
                        ? 'Dostęp do lokalizacji został zablokowany w przeglądarce.'
                        : 'Nie udało się pobrać lokalizacji.'
                );
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
        );
    };

    const runSearch = async (q) => {
        if (q.trim().length < 3) { setResults([]); return; }
        setSearching(true);
        try {
            // viewbox Wrocławia — zawęża wyniki (WF-03, prototyp ograniczony do Wrocławia)
            const viewbox = '16.8,51.2,17.2,51.0';
            const res = await fetch(
                `${NOMINATIM_URL}/search?format=jsonv2&q=${encodeURIComponent(q)}&viewbox=${viewbox}&bounded=1&limit=6&accept-language=pl`,
                { headers: NOMINATIM_HEADERS }
            );
            const data = await res.json();
            setResults(data ?? []);
        } finally {
            setSearching(false);
        }
    };

    // Debounce — uruchom wyszukiwanie 400 ms po ostatnim wpisanym znaku
    useEffect(() => {
        const t = setTimeout(() => runSearch(search), 400);
        return () => clearTimeout(t);
    }, [search]);

    const pickResult = (r) => {
        onChange([parseFloat(r.lat), parseFloat(r.lon)]);
        setSearch(r.display_name);
        setResults([]);
    };

    return (
        <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
                Kliknij na mapę, żeby wskazać miejsce. Możesz też użyć swojej lokalizacji
                lub wyszukać adres.
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <Box sx={{ position: 'relative', flex: 1 }}>
                    <TextField
                        fullWidth
                        size="small"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Wyszukaj adres (np. Świdnicka 12)"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon fontSize="small" color="action" />
                                </InputAdornment>
                            ),
                            endAdornment: (
                                <InputAdornment position="end">
                                    {searching && <CircularProgress size={16} />}
                                    {search && !searching && (
                                        <IconButton size="small" onClick={() => { setSearch(''); setResults([]); }}>
                                            <ClearIcon fontSize="small" />
                                        </IconButton>
                                    )}
                                </InputAdornment>
                            ),
                        }}
                    />
                    {results.length > 0 && (
                        <Paper
                            elevation={3}
                            sx={{
                                position: 'absolute',
                                top: '100%', left: 0, right: 0,
                                mt: 0.5, zIndex: 10,
                                maxHeight: 280,
                                overflowY: 'auto',
                            }}
                        >
                            <List dense disablePadding>
                                {results.map((r) => (
                                    <ListItemButton key={r.place_id} onClick={() => pickResult(r)}>
                                        <ListItemText
                                            primary={r.display_name}
                                            primaryTypographyProps={{ fontSize: '0.8125rem' }}
                                        />
                                    </ListItemButton>
                                ))}
                            </List>
                        </Paper>
                    )}
                </Box>
                <Button
                    variant="outlined"
                    startIcon={<MyLocationIcon />}
                    onClick={useMyLocation}
                    sx={{ flexShrink: 0 }}
                >
                    Moja lokalizacja
                </Button>
            </Stack>

            {geoError && <Alert severity="warning" onClose={() => setGeoError(null)}>{geoError}</Alert>}

            <Box
                sx={{
                    height: 360,
                    borderRadius: 2,
                    overflow: 'hidden',
                    border: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <MapContainer
                    center={location ?? WROCLAW_CENTER}
                    zoom={location ? 16 : DEFAULT_ZOOM}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <ClickCapture onPick={(p) => onChange(p)} />
                    <Recenter location={location} />
                    {location && (
                        <Marker
                            position={location}
                            draggable
                            icon={createColoredIcon('#5B5FED')}
                            eventHandlers={{
                                dragend: (e) => {
                                    const pos = e.target.getLatLng();
                                    onChange([pos.lat, pos.lng]);
                                },
                            }}
                        />
                    )}
                </MapContainer>
            </Box>

            {location ? (
                <Alert severity="success" icon={false}>
                    <Typography variant="body2" fontWeight={600}>
                        Wybrana lokalizacja:
                    </Typography>
                    <Typography variant="body2">
                        {address ?? `${location[0].toFixed(5)}, ${location[1].toFixed(5)}`}
                    </Typography>
                </Alert>
            ) : (
                <Alert severity="info" icon={false}>
                    Kliknij na mapę lub wyszukaj adres, żeby wskazać miejsce zgłoszenia.
                </Alert>
            )}
        </Stack>
    );
};

export default StepLocation;
