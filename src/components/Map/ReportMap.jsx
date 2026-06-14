import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { WROCLAW_CENTER, DEFAULT_ZOOM, STATUS_COLORS } from '../../config/mapConfig';
import { createColoredIcon } from '../../utils/leafletIcons';

// Komponent wymuszający resize mapy po zamontowaniu
const MapResizer = () => {
    const map = useMap();
    useEffect(() => {
        setTimeout(() => map.invalidateSize(), 100);
    }, [map]);
    return null;
};

// Uwaga: w nowym designie nie używamy już leafletowych <Popup>.
// Szczegóły pokazywane są w <PropertyBottomSheet> — stąd callback onMarkerClick.
const ReportMap = ({ reports = [], height = '100%', onMarkerClick }) => {
    return (
        <MapContainer
            center={WROCLAW_CENTER}
            zoom={DEFAULT_ZOOM}
            style={{ height, width: '100%' }}
            zoomControl={false}
        >
            <MapResizer />
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {reports.map((report) => (
                <Marker
                    key={report.id}
                    position={[report.address?.latitude ?? report.lat, report.address?.longitude ?? report.lng]}
                    icon={createColoredIcon(STATUS_COLORS[report.status] ?? '#757575')}
                    eventHandlers={{
                        click: () => onMarkerClick?.(report),
                    }}
                />
            ))}
        </MapContainer>
    );
};

export default ReportMap;
