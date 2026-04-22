export const CATEGORIES = [
    { id: 'road',         label: 'Drogi i chodniki',     color: '#E53935', emoji: '🛣️' },
    { id: 'lighting',     label: 'Oświetlenie',           color: '#FB8C00', emoji: '💡' },
    { id: 'greenery',     label: 'Zieleń i drzewa',       color: '#43A047', emoji: '🌳' },
    { id: 'waste',        label: 'Odpady i czystość',     color: '#8E24AA', emoji: '🗑️' },
    { id: 'water',        label: 'Woda i kanalizacja',    color: '#1E88E5', emoji: '💧' },
    { id: 'transport',    label: 'Transport publiczny',   color: '#00ACC1', emoji: '🚌' },
    { id: 'safety',       label: 'Bezpieczeństwo',        color: '#F4511E', emoji: '⚠️' },
    { id: 'other',        label: 'Inne',                  color: '#757575', emoji: '📋' },
];

export const STATUS_CONFIG = {
    SUBMITTED:    { label: 'Złożone',       color: 'default',  muiColor: '#757575' },
    ACCEPTED:     { label: 'Przyjęte',      color: 'info',     muiColor: '#1E88E5' },
    IN_PROGRESS:  { label: 'W realizacji',  color: 'warning',  muiColor: '#FB8C00' },
    RESOLVED:     { label: 'Zakończone',    color: 'success',  muiColor: '#43A047' },
    REJECTED:     { label: 'Odrzucone',     color: 'error',    muiColor: '#E53935' },
};