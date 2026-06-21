import { useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import debounce from 'lodash.debounce';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { WROCLAW_CENTER, DEFAULT_ZOOM, STATUS_COLORS, STATUS_LABELS } from '../../config/mapConfig';
import { BACKEND_CATEGORY_TO_LABEL } from '../../config/reportCategories';
import { createColoredIcon } from '../../utils/leafletIcons';

const MapResizer = () => {
    const map = useMap();
    useEffect(() => {
        setTimeout(() => map.invalidateSize(), 100);
    }, [map]);
    return null;
};

const BoundingBoxListener = ({ onBoundsChange }) => {
    const callbackRef = useRef(onBoundsChange);
    useEffect(() => {
        callbackRef.current = onBoundsChange;
    }, [onBoundsChange]);

    const map = useMapEvents({
        moveend: () => {
            const bounds = map.getBounds();
            callbackRef.current({
                minLat: bounds.getSouthWest().lat,
                maxLat: bounds.getNorthEast().lat,
                minLng: bounds.getSouthWest().lng,
                maxLng: bounds.getNorthEast().lng,
            });
        },
    });

    // Fire once on mount only
    useEffect(() => {
        const bounds = map.getBounds();
        callbackRef.current({
            minLat: bounds.getSouthWest().lat,
            maxLat: bounds.getNorthEast().lat,
            minLng: bounds.getSouthWest().lng,
            maxLng: bounds.getNorthEast().lng,
        });
    }, [map]);

    return null;
};

const createClusterIcon = (cluster) => {
    const count = cluster.getChildCount();
    let size, fontSize, bgColor;

    if (count < 10) {
        size = 44;
        fontSize = 16;
        bgColor = 'rgba(33, 150, 243, 0.85)';  // blue
    } else if (count < 50) {
        size = 54;
        fontSize = 18;
        bgColor = 'rgba(255, 152, 0, 0.85)';   // orange
    } else {
        size = 64;
        fontSize = 20;
        bgColor = 'rgba(244, 67, 54, 0.85)';   // red
    }

    return L.divIcon({
        html: `<div style="
            width: ${size}px;
            height: ${size}px;
            border-radius: 50%;
            background: ${bgColor};
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.35);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: ${fontSize}px;
            font-weight: 700;
            font-family: 'Roboto', sans-serif;
        ">${count}</div>`,
        className: '',
        iconSize: L.point(size, size),
        iconAnchor: L.point(size / 2, size / 2),
    });
};

const ReportMap = ({ reports = [], height = '100%', onMarkerClick, onBoundsChange }) => {
    const debouncedBoundsChange = useMemo(
        () => debounce((bounds) => onBoundsChange?.(bounds), 400),
        [onBoundsChange]
    );

    return (
        <MapContainer
            center={WROCLAW_CENTER}
            zoom={DEFAULT_ZOOM}
            style={{ height, width: '100%' }}
            zoomControl={false}
        >
            <MapResizer />
            <BoundingBoxListener onBoundsChange={debouncedBoundsChange} />
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MarkerClusterGroup chunkedLoading maxClusterRadius={60} disableClusteringAtZoom={17} iconCreateFunction={createClusterIcon}>
                {reports.map((report) => (
                    <Marker
                        key={report.id}
                        position={[report.address?.latitude ?? report.lat, report.address?.longitude ?? report.lng]}
                        icon={createColoredIcon(STATUS_COLORS[report.status] ?? '#757575')}
                        eventHandlers={{
                            click: () => onMarkerClick?.(report),
                        }}
                    >
                        <Tooltip direction="top" offset={[0, -10]} opacity={1} className="custom-tooltip">
                            <div className="tooltip-inner">
                                <span style={{ color: '#5B5FED', fontWeight: 700, fontSize: 13 }}>{BACKEND_CATEGORY_TO_LABEL[report.category] ?? report.category}</span>
                                <span style={{ color: '#bbb', margin: '0 6px' }}>•</span>
                                <span style={{ color: '#555', fontSize: 12 }}>{report.title}</span>
                            </div>
                        </Tooltip>
                    </Marker>
                ))}
            </MarkerClusterGroup>
        </MapContainer>
    );
};

export default ReportMap;
