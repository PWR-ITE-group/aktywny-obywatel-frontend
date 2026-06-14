import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, IconButton, Fab, Stack } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import DirectionsSubwayIcon from '@mui/icons-material/DirectionsSubway';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import TuneIcon from '@mui/icons-material/Tune';

import ReportMap from '../components/Map/ReportMap';
import PropertyBottomSheet from '../components/Map/PropertyBottomSheet';
import { MOCK_REPORTS } from '../config/mapConfig';
import { complaintService } from '../services/complaintService';

const PublicMapPage = () => {
    const navigate = useNavigate();
    const [filters] = useState({ status: '', category: '' });
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const data = await complaintService.getAll();
                setReports(data);
            } catch (error) {
                console.error('Failed to load reports for map:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, []);

    const filteredReports = useMemo(() => {
        return reports.filter((r) => {
            if (filters.status && r.status !== filters.status) return false;
            if (filters.category && r.category !== filters.category) return false;
            return true;
        });
    }, [filters, reports]);

    // Kliknięcie markera -> otwórz bottom sheet z danymi tego zgłoszenia
    const handleMarkerClick = (report) => {
        setSelected({
            id: report.id,
            title: report.title,
            description: report.description,
            address: `${report.address?.street ? `${report.address.street} ${report.address.houseNumber || ''}`.trim() : (report.address?.displayName || 'Brak adresu')} • ${new Date(report.createdAt).toLocaleDateString()}`,
            isFavorite: false,
        });
    };

    return (
        <Box sx={{ position: 'fixed', inset: 0, overflow: 'hidden' }}>
            {/* Pełnoekranowa mapa */}
            <ReportMap
                reports={filteredReports}
                height="100%"
                onMarkerClick={handleMarkerClick}
            />

            {/* Ikony overlay — lewy górny: X, prawy górny: ?, M, zakładka */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 12, left: 12, right: 12,
                    display: 'flex',
                    justifyContent: 'space-between',
                    pointerEvents: 'none', // żeby kliknięcia w puste miejsca przechodziły na mapę
                    zIndex: 1000,
                }}
            >
                <IconButton
                    onClick={() => navigate('/')}
                    sx={{ bgcolor: 'background.paper', boxShadow: 2, pointerEvents: 'auto' }}
                >
                    <CloseIcon />
                </IconButton>
                <Stack direction="row" spacing={1} sx={{ pointerEvents: 'auto' }}>
                    <IconButton
                        sx={{ bgcolor: 'background.paper', boxShadow: 2 }}
                        onClick={() => alert('Pomoc: Użyj mapy, aby zgłosić problemy w mieście. Kliknij na marker, aby zobaczyć szczegóły zgłoszenia.')}
                    >
                        <HelpOutlineIcon />
                    </IconButton>
                    <IconButton
                        sx={{ bgcolor: 'background.paper', boxShadow: 2 }}
                        onClick={() => {
                            // Center map on user's current location would require geolocation
                            // For now, center on Wrocław
                            alert('Centruję mapę na Twoją lokalizację (wymaga zgody na udostępnianie lokalizacji)');
                        }}
                    >
                        <DirectionsSubwayIcon />
                    </IconButton>
                    <IconButton
                        sx={{ bgcolor: 'background.paper', boxShadow: 2 }}
                        onClick={() => {
                            // Add to favorites/bookmarks
                            alert('Dodano do ulubionych!');
                        }}
                    >
                        <BookmarkBorderIcon />
                    </IconButton>
                </Stack>
            </Box>

            {/* Pływające przyciski po prawej — lokalizacja i filtry */}
            <Stack
                spacing={1.5}
                sx={{
                    position: 'absolute',
                    bottom: 100, right: 16,
                    zIndex: 1000,
                }}
            >
                <Fab size="medium" sx={{ bgcolor: 'background.paper' }} aria-label="Moja lokalizacja">
                    <MyLocationIcon color="primary" />
                </Fab>
                <Fab size="medium" sx={{ bgcolor: 'background.paper' }} aria-label="Filtry">
                    <TuneIcon color="primary" />
                </Fab>
            </Stack>

            {/* Bottom sheet z info o obiekcie */}
            <PropertyBottomSheet
                open={Boolean(selected)}
                onClose={() => setSelected(null)}
                property={selected}
                nearbyItems={selected?.nearby ?? []}
                onSelect={() => {
                    navigate('/nowe-zgloszenie', {
                        state: { prefilledLocation: selected },
                    });
                }}
                onToggleFavorite={() => {
                    setSelected((prev) => prev ? { ...prev, isFavorite: !prev.isFavorite } : prev);
                }}
            />
        </Box>
    );
};

export default PublicMapPage;
