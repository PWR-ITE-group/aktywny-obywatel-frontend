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

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org';
const NOMINATIM_HEADERS = { 'Accept-Language': 'pl' };

const ClickCapture = ({ onPick }) => {
    useMapEvents({
        click(e) {
            onPick([e.latlng.lat, e.latlng.lng]);
        },
    });
    return null;
};

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

    useEffect(() => {
        if (!location) { setAddress(null); return; }
        const [lat, lng] = location;
        const ctrl = new AbortController();

        fetch(
            `${NOMINATIM_URL}/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=pl&addressdetails=1`,
            { headers: NOMINATIM_HEADERS, signal: ctrl.signal }
        )
            .then((r) => r.ok ? r.json() : null)
            .then((data) => {
                if (data) {
                    setAddress(data.display_name);
                    // Zwracamy tablicę lokalizacji oraz pełny obiekt danych adresowych z OSM do nadrzędnego formularza
                    onChange(location, data);
                }
            })
            .catch(() => {});
        return () => ctrl.abort();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location]);

    const useMyLocation = () => {
        if (!navigator.geolocation) {
            setGeoError('Twoja przeglądarka nie wspiera geolokalizacji.');
            return;
        }
        setGeoError(null);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                onChange([pos.coords.latitude, pos.coords.longitude], null);
            },
            () => {
                setGeoError('Nie udało się pobrać lokalizacji. Wybierz miejsce na mapie ręcznie.');
            }
        );
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!search.trim()) return;
        setSearching(true);
        try {
            const res = await fetch(
                `${NOMINATIM_URL}/search?format=jsonv2&q=${encodeURIComponent(search + ', Wrocław')}&addressdetails=1`,
                { headers: NOMINATIM_HEADERS }
            );
            const data = await res.json();
            setResults(data);
        } catch {
            setGeoError('Błąd podczas wyszukiwania adresu.');
        } finally {
            setSearching(false);
        }
    };

    return (
        <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
                Wskaż miejsce problemu klikając na mapie lub wpisując adres.
            </Typography>

            <form onSubmit={handleSearch}>
                <TextField
                    placeholder="Wpisz ulicę i numer we Wrocławiu..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    fullWidth
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                {searching ? <CircularProgress size={20} /> : <SearchIcon color="action" />}
                            </InputAdornment>
                        ),
                        endAdornment: search && (
                            <InputAdornment position="end">
                                <IconButton onClick={() => { setSearch(''); setResults([]); }}>
                                    <ClearIcon />
                                </IconButton>
                            </InputAdornment>
                        )
                    }}
                />
            </form>

            {results.length > 0 && (
                <Paper sx={{ maxHeight: 200, overflow: 'auto', zIndex: 1000, border: '1px solid', borderColor: 'divider' }}>
                    <List dense>
                        {results.map((r) => (
                            <ListItemButton
                                key={r.place_id}
                                onClick={() => {
                                    onChange([parseFloat(r.lat), parseFloat(r.lon)], r);
                                    setResults([]);
                                    setSearch(r.display_name);
                                }}
                            >
                                <ListItemText primary={r.display_name} />
                            </ListItemButton>
                        ))}
                    </List>
                </Paper>
            )}

            <Button startIcon={<MyLocationIcon />} variant="outlined" onClick={useMyLocation} fullWidth>
                Użyj mojej lokalizacji
            </Button>

            {geoError && <Alert severity="warning">{geoError}</Alert>}

            <Box sx={{ height: 300, borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider', position: 'relative' }}>
                <MapContainer
                    center={location || WROCLAW_CENTER || [51.107883, 17.038538]}
                    zoom={location ? 16 : DEFAULT_ZOOM || 12}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        attribution='&copy; OpenStreetMap'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <ClickCapture onPick={(latlng) => onChange(latlng, null)} />
                    {location && <Marker position={location} icon={createColoredIcon('#5B5FED')} />}
                    <Recenter location={location} />
                </MapContainer>
            </Box>

            {address && (
                <Alert severity="info" icon={false}>
                    <Typography variant="caption" display="block" color="text.secondary">Wybrany adres:</Typography>
                    <Typography variant="body2" fontWeight={500}>{address}</Typography>
                </Alert>
            )}
        </Stack>
    );
};

export default StepLocation;