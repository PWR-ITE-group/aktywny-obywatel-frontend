// complaintService.js
import api from '../config/api';

const USE_MOCK = false;
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// SYMULACJA TABELI W BAZIE DANYCH (To tu admin będzie robił zmiany)
const MOCK_CATEGORIES_FROM_DB = [
    {
        id: 'transport',
        label: 'Komunikacja miejska',
        color: '#00ACC1',
        email: 'bop@mpk.wroc.pl', // Domyślny mail dla całej kategorii
        topics: [
            'Uszkodzona ławka na przystanku',
            'Uszkodzenie słupka przystankowego',
            'Problem z oznakowaniem przystanku',
            'Uszkodzona tablica informacyjna',
            'Akty wandalizmu na elementach infrastruktury przystankowej',
            'Problem z oświetleniem wiaty przystankowej',
            'Uszkodzone torowisko',
            'Niedziałające tablice przystankowe',
        ],
    },
    {
        id: 'cleaning',
        label: 'Sprzątanie i odpady',
        color: '#8E24AA',
        email: 'ekosystem@ekosystem.wroc.pl',
        topics: [
            'Odśnieżanie/sprzątanie ulic, chodników, dróg miejskich lub przystanków',
            'Zniszczone lub przepełnione kosze na śmieci',
            'Wniosek o podstawienie pojemników na odpady',
            'Dzikie wysypiska i odpady',
            'Problem z wywozem śmieci',
            'Potrzeba przeprowadzenia deratyzacji',
            'Brak lub uszkodzenie pojemników/worków na odpady / kontenery',
            'Odbiór choinek',
        ],
    },
    {
        id: 'greenery',
        label: 'Zieleń i parki',
        color: '#43A047',
        email: 'sekretariat@zzm.wroc.pl',
        topics: [
            'Utrzymanie i pielęgnacja zieleni miejskiej (również w pasie drogowym)',
            'Wniosek o nowe nasadzenia',
            'Nieprawidłowe działanie toalet samoobsługowych w parkach',
            'Nieuprzątnięty śnieg z alejek w parkach',
            'Brak lub awaria oświetlenia na terenach zielonych',
        ],
    },
    {
        id: 'water',
        label: 'Woda i ścieki',
        color: '#1E88E5',
        email: 'pogotowie@mpwik.wroc.pl',
        topics: [
            'Brak zimnej wody w kranie',
            'Problem z jakością wody (kolor, zapach, smak)',
            'Wyciek wody z sieci',
            'Awaria kanalizacji',
            'Niedrożne/uszkodzone studzienki lub wpusty deszczowe',
        ],
    },
    {
        id: 'roads',
        label: 'Drogi i ulice',
        color: '#E53935',
        email: 'zgloszenia@zdium.wroc.pl',
        topics: [
            'Dziury w drodze, jezdni lub chodniku miejskim',
            'Problem z przejściem dla pieszych (malowanie pasów, oznakowanie)',
            'Konieczność doświetlenia przejścia dla pieszych',
            'Wniosek o uspokojenie ruchu (progi zwalniające, wzniesione przejścia, azyle)',
            'Uszkodzenie lub brak infrastruktury miejskiej/drogowej (ławki, pokrywy studzienek)',
            'Uszkodzone bariery lub elementy segregacji ruchu',
            'Problem ze znakami drogowymi i oznakowaniem informacyjnym',
            'Awaria sygnalizacji świetlnej',
            'Problem z oświetleniem ulicznym',
            'Uszkodzenie wiaty przystankowej',
            'Niewłaściwe lub nieaktualne oznakowanie robót drogowych',
            'Inne nieprawidłowości w pasie drogowym',
        ],
    },
    {
        id: 'waste-burning',
        label: 'Palenie odpadów',
        color: '#F4511E',
        email: 'straz@smwroclaw.pl',
        topics: ['Palenie odpadów / podezrzany dym z komina'],
    },
    {
        id: 'parking',
        label: 'Niepoprawne parkowanie',
        color: '#FB8C00',
        email: 'straz@smwroclaw.pl',
        topics: ['Niepoprawne parkowanie (zastawianie chodników, parkowanie przy przejściach/skrzyżowaniach)'],
    },
    {
        id: 'no-entry',
        label: 'Nieprzestrzeganie zakazu wjazdu',
        color: '#E53935',
        email: 'straz@smwroclaw.pl',
        topics: ['Nieprzestrzeganie zakazu wjazdu'],
    },
    {
        id: 'illegal-dumping',
        label: 'Nielegalne składowanie odpadów',
        color: '#8E24AA',
        email: 'wios@wroclaw.wios.gov.pl',
        topics: ['Nielegalne składowanie, przetwarzanie, wyrzucanie lub wylewanie odpadów (WIOŚ)'],
    },
    {
        id: 'waterways',
        label: 'Wody i rzeki',
        color: '#00ACC1',
        email: 'nw-wroclaw@wody.gov.pl',
        topics: ['Zaśmiecanie rzek i terenów nadrzecznych', 'Zatory rzeczne / niepokojący stan wody'],
    },
    {
        id: 'animals',
        label: 'Zwierzęta',
        color: '#43A047',
        email: 'czk@um.wroc.pl', // Domyślny dla CZK (dzikie/martwe)
        // Tutaj admin konfiguruje mapowanie specyficzne dla konkretnych tematów
        topicEmails: {
            'Ranne zwierzęta (Ekostraż)': 'info@ekostraz.pl',
            'Bezdomne zwierzęta (TOZ Wrocław / Schronisko)': 'biuro@schroniskowroclaw.pl',
        },
        topics: [
            'Dzikie lub martwe zwierzęta (Centrum Zarządzania Kryzysowego)',
            'Ranne zwierzęta (Ekostraż)',
            'Bezdomne zwierzęta (TOZ Wrocław / Schronisko)',
        ],
    },
    {
        id: 'hate-speech',
        label: 'Mowa nienawiści',
        color: '#757575',
        email: 'kontakt@wcsn.pl',
        topics: ['Mowa nienawiści (obraźliwe rysunki i napisy na elewacjach, wiatach itp.)'],
    },
    {
        id: 'railway',
        label: 'Problemy z przejazdami kolejowymi',
        color: '#FB8C00',
        email: 'sekretariat.iif@plk-sa.pl',
        topicEmails: {
            'PILNE: Zagrożenie życia/zdrowia lub wypadek na przejeździe (Zadzwoń pod 112!)': '112',
        },
        topics: [
            'Awaria przejazdu kolejowego (PKP PLK)',
            'PILNE: Zagrożenie życia/zdrowia lub wypadek na przejeździe (Zadzwoń pod 112!)',
        ],
    },
    {
        id: 'power-outage',
        label: 'Awaria prądu',
        color: '#FBC02D',
        email: 'info@tauron-dystrybucja.pl',
        disclaimer: 'Jeśli mieszkanie jest własnością wspólnoty mieszkaniowej/spółdzielni, skontaktuj się bezpośrednio z tą jednostką.',
        topics: ['Zgłoszenie awarii prądu jako właściciel nieruchomości (Tauron)'],
    },
    {
        id: 'other',
        label: 'Pozostałe zgłoszenia',
        color: '#9E9E9E',
        email: 'kum@um.wroc.pl',
        topics: ['Inne zgłoszenie niewymienione na liście'],
    },
];

export const complaintService = {
    // NOWA METODA: Pobiera kategorie i ich tematy z "bazy danych"
    async getCategories() {
        if (USE_MOCK) {
            await delay(200);
            return MOCK_CATEGORIES_FROM_DB;
        }
        const { data } = await api.get('/api/complaints/categories');
        return data.data;
    },

    async create(complaintData) {
        if (USE_MOCK) {
            await delay(500);

            // Pobieramy konfigurację wybranej kategorii z naszej "bazy"
            const categoryConfig = MOCK_CATEGORIES_FROM_DB.find((c) => c.id === complaintData.category);

            // Sprawdzamy, czy dany temat ma dedykowany e-mail, jeśli nie - bierzemy ogólny dla kategorii
            let targetEmail = categoryConfig?.topicEmails?.[complaintData.title] || categoryConfig?.email || 'kum@um.wroc.pl';

            console.log(
                `%c[BACKEND MOCK] Zapisano w DB i wysłano zgłoszenie do: ${targetEmail}`,
                'color: #43A047; font-weight: bold;'
            );

            return {
                id: Date.now(),
                ...complaintData,
                status: 'złożone',
                createdAt: new Date().toISOString().split('T')[0],
            };
        }
        const { data } = await api.post('/api/complaints', complaintData);
        return data.data;
    },

    // METODA DO DODAWANIA ZAŁĄCZNIKÓW
    async addAttachment(complaintId, file) {
        if (USE_MOCK) {
            await delay(500);
            // Symulacja sukcesu
            return {
                id: Date.now(),
                complaintId,
                filename: file.name,
                uploadedAt: new Date().toISOString(),
            };
        }

        const formData = new FormData();
        formData.append('file', file);

        const { data } = await api.post(`/api/complaints/${complaintId}/attachments`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return data.data;
    },

    // METODA DO POBIERANIA ZAŁĄCZNIKÓW
    async getAttachments(complaintId) {
        if (USE_MOCK) {
            await delay(300);
            // Zwracamy pustą listę w trybie mock
            return [];
        }
        const { data } = await api.get(`/api/complaints/${complaintId}/attachments`);
        return data.data;
    },
};