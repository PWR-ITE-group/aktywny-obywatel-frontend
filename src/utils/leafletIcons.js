import L from 'leaflet';

// Fix dla domyślnych ikon Leaflet w Vite/Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Tworzenie kolorowego markera SVG
export const createColoredIcon = (color) =>
    L.divIcon({
        className: '',
        html: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="24" height="36">
        <path
          d="M12 0C5.373 0 0 5.373 0 12c0 9 12 24 12 24S24 21 24 12C24 5.373 18.627 0 12 0z"
          fill="${color}"
          stroke="white"
          stroke-width="1.5"
        />
        <circle cx="12" cy="12" r="5" fill="white" opacity="0.9"/>
      </svg>
    `,
        iconSize: [24, 36],
        iconAnchor: [12, 36],
        popupAnchor: [0, -36],
    });