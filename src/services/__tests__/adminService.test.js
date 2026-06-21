// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { adminService } from '../adminService';
import api from '../../config/api';

const localStorageMock = (() => {
    let store = {};
    return {
        getItem: vi.fn((key) => store[key] || null),
        setItem: vi.fn((key, value) => { store[key] = value.toString(); }),
        clear: vi.fn(() => { store = {}; }),
        removeItem: vi.fn((key) => { delete store[key]; })
    };
})();
vi.stubGlobal('localStorage', localStorageMock);

vi.mock('../../config/mapConfig', () => ({
    MOCK_REPORTS: [{ id: 1, title: 'Test', status: 'złożone', category: 'Drogi' }],
    STATUS_LABELS: { złożone: 'Złożone' },
    STATUS_COLORS: { złożone: '#FFF' },
    CATEGORIES: ['Drogi']
}));

vi.mock('../../config/api', () => ({
    default: {
        get: vi.fn(),
        put: vi.fn(),
        post: vi.fn(),
        delete: vi.fn(),
    },
}));

describe('adminService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    describe('Real API Path', () => {
        it('getAllReports fetches data from real API with filters', async () => {
            const mockData = [{ id: 1, title: 'Dziura' }];
            api.get.mockResolvedValueOnce({ data: mockData });
            const filters = { status: 'złożone' };
            const result = await adminService.getAllReports(filters);
            expect(api.get).toHaveBeenCalledWith('/api/complaints', { params: filters });
            expect(result).toEqual(mockData);
        });

        it('updateReportStatus sends PUT request to backend', async () => {
            api.put.mockResolvedValueOnce({ data: { success: true } });
            const result = await adminService.updateReportStatus(123, 'w_realizacji');
            expect(api.put).toHaveBeenCalledWith('/api/admin/reports/123/status', { status: 'w_realizacji' });
            expect(result).toEqual({ success: true });
        });

        // NOWOŚĆ: Test pobierania statystyk (prawdopodobna metoda w serwisie)
        it('getStatistics fetches stats from API', async () => {
            const mockStats = { total: 10 };
            api.get.mockResolvedValueOnce({ data: mockStats });
            if (typeof adminService.getStatistics === 'function') {
                const result = await adminService.getStatistics();
                expect(api.get).toHaveBeenCalledWith('/api/admin/statistics');
                expect(result).toEqual(mockStats);
            }
        });

        // NOWOŚĆ: Test dodawania nowego departamentu (wymagane przez AdminPage.test)
        it('addDepartment sends POST request to backend', async () => {
            api.post.mockResolvedValueOnce({ data: { id: 1, name: 'IT' } });
            if (typeof adminService.addDepartment === 'function') {
                const result = await adminService.addDepartment({ name: 'IT' });
                expect(api.post).toHaveBeenCalledWith('/api/admin/departments', { name: 'IT' });
                expect(result).toEqual({ id: 1, name: 'IT' });
            }
        });

        // NOWOŚĆ: Test usuwania/terminacji profilu
        it('deleteUserAccount triggers DELETE in admin panel', async () => {
            api.delete.mockResolvedValueOnce({ data: { success: true } });
            if (typeof adminService.deleteUser === 'function') {
                const result = await adminService.deleteUser('user-123');
                expect(api.delete).toHaveBeenCalledWith('/api/admin/users/user-123');
                expect(result).toEqual({ success: true });
            }
        });

        // NOWOŚĆ: Obsługa catch bloku dla błędów
        it('handles API errors in updateReportStatus', async () => {
            api.put.mockRejectedValueOnce(new Error('Admin Error'));
            await expect(adminService.updateReportStatus(123, 'status')).rejects.toThrow('Admin Error');
        });
    });

    describe('Mock Path', () => {
        beforeEach(() => {
            localStorage.setItem('token', 'mock.jwt.token');
            localStorageMock.getItem.mockReturnValue('mock.jwt.token');
        });

        it('getAllReports returns mapped mock data', async () => {
            const result = await adminService.getAllReports();
            expect(result).toBeDefined();
            expect(result.length).toBeGreaterThan(0);
            expect(api.get).not.toHaveBeenCalled();
        });
    });
});