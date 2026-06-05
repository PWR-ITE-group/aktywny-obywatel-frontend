import api from '../config/api';

const USE_MOCK = true;
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const MOCK_REPORTS = [
    {
        id: 1,
        title: 'Dziura w jezdni',
        category: 'drogi',
        status: 'w realizacji',
        lat: 51.1079,
        lng: 17.0385,
        description: 'Duża dziura w jezdni na skrzyżowaniu.',
        createdAt: '2026-04-10',
    },
    {
        id: 2,
        title: 'Uszkodzona latarnia',
        category: 'oswietlenie',
        status: 'złożone',
        lat: 51.1134,
        lng: 17.0412,
        description: 'Latarnia nie świeci od tygodnia.',
        createdAt: '2026-04-15',
    },
];

export const complaintService = {

    async getAll(filters = {}) {
        if (USE_MOCK) {
            await delay(400);
            let results = [...MOCK_REPORTS];
            if (filters.status) results = results.filter((r) => r.status === filters.status);
            if (filters.category) results = results.filter((r) => r.category === filters.category);
            return results;
        }
        const { data } = await api.get('/api/complaints', { params: filters });
        return data.data;
    },

    async getById(id) {
        if (USE_MOCK) {
            await delay(300);
            const found = MOCK_REPORTS.find((r) => r.id === id);
            if (!found) throw new Error('Zgłoszenie nie istnieje.');
            return found;
        }
        const { data } = await api.get(`/api/complaints/${id}`);
        return data.data;
    },

    async create(complaintData) {
        if (USE_MOCK) {
            await delay(800);
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
};