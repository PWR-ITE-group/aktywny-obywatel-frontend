// Centrum Wrocławia
export const WROCLAW_CENTER = [51.1079, 17.0385];
export const DEFAULT_ZOOM = 13;

// Kolory markerów według statusu zgłoszenia
export const STATUS_COLORS = {
    złożone: '#1565C0',
    przyjęte: '#F57F17',
    'w realizacji': '#00897B',
    zakończone: '#2E7D32',
    odrzucone: '#C62828',
    NEW: '#F57F17',
    ROUTED: '#00897B',
    NOTIFIED: '#00897B',
    RESOLVED: '#2E7D32',
};

export const STATUS_LABELS = {
    złożone: 'Złożone',
    przyjęte: 'Przyjęte',
    'w realizacji': 'W realizacji',
    zakończone: 'Zakończone',
    odrzucone: 'Odrzucone',
    NEW: 'Przyjęte',
    ROUTED: 'W realizacji',
    NOTIFIED: 'W realizacji',
    RESOLVED: 'Zakończone',
};

export const CATEGORIES = [
    'Drogi i chodniki',
    'Oświetlenie',
    'Zieleń miejska',
    'Odpady',
    'Wodociągi i kanalizacja',
    'Bezpieczeństwo',
    'Inne',
];

// Mock zgłoszeń — do zastąpienia przez API
export const MOCK_REPORTS = [
    {
        id: 1,
        title: 'Dziura w jezdni',
        category: 'Drogi i chodniki',
        status: 'w realizacji',
        lat: 51.1079,
        lng: 17.0385,
        description: 'Duża dziura w jezdni na skrzyżowaniu, stanowi zagrożenie.',
        createdAt: '2026-04-10',
    },
    {
        id: 2,
        title: 'Uszkodzona latarnia',
        category: 'Oświetlenie',
        status: 'złożone',
        lat: 51.1134,
        lng: 17.0412,
        description: 'Latarnia nie świeci od tygodnia.',
        createdAt: '2026-04-15',
    },
    {
        id: 3,
        title: 'Połamane drzewo',
        category: 'Zieleń miejska',
        status: 'przyjęte',
        lat: 51.1021,
        lng: 17.0331,
        description: 'Po burzy połamane drzewo blokuje chodnik.',
        createdAt: '2026-04-18',
    },
    {
        id: 4,
        title: 'Przepełniony kosz',
        category: 'Odpady',
        status: 'zakończone',
        lat: 51.1155,
        lng: 17.0298,
        description: 'Kosz przy parku przepełniony od kilku dni.',
        createdAt: '2026-04-01',
    },
    {
        id: 5,
        title: 'Uszkodzony chodnik',
        category: 'Drogi i chodniki',
        status: 'złożone',
        lat: 51.1063,
        lng: 17.0451,
        description: 'Płyty chodnikowe uniesione, niebezpieczne dla pieszych.',
        createdAt: '2026-04-20',
    },
];