import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Box, Typography, Chip, Button, Divider } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import { WROCLAW_CENTER, DEFAULT_ZOOM, STATUS_COLORS, STATUS_LABELS } from '../../config/mapConfig';
import { createColoredIcon } from '../../utils/leafletIcons';

// Komponent wymuszający resize mapy po zamontowaniu
// (fix dla przypadku gdy mapa renderuje się w ukrytym kontenerze)
const MapResizer = () => {
    const map = useMap();
    useEffect(() => {
        setTimeout(() => map.invalidateSize(), 100);
    }, [map]);
    return null;
};

const ReportMap = ({ reports = [], height = '100%' }) => {
    return (
        <MapContainer
            center={WROCLAW_CENTER}
            zoom={DEFAULT_ZOOM}
            style={{ height, width: '100%' }}
            // Atrybucja OSM — wymagana zgodnie z licencją
        >
            <MapResizer />
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {reports.map((report) => (
                <Marker
                    key={report.id}
                    position={[report.lat, report.lng]}
                    icon={createColoredIcon(STATUS_COLORS[report.status] ?? '#757575')}
                >
                    <Popup minWidth={220}>
                        <Box sx={{ p: 0.5 }}>
                            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                {report.title}
                            </Typography>
                            <Chip
                                label={STATUS_LABELS[report.status] ?? report.status}
                                size="small"
                                sx={{
                                    bgcolor: STATUS_COLORS[report.status] ?? '#757575',
                                    color: 'white',
                                    fontWeight: 500,
                                    mb: 1,
                                }}
                            />
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                {report.category}
                            </Typography>
                            <Divider sx={{ my: 0.5 }} />
                            <Typography variant="body2" sx={{ mb: 1 }}>
                                {report.description}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Zgłoszono: {report.createdAt}
                            </Typography>
                        </Box>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};

export default ReportMap;