// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { complaintService } from '../complaintService';
import api from '../../config/api';

vi.mock('../../config/api', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
    },
}));

describe('complaintService (Real API)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('getCategories fetches categories from API', async () => {
        const mockCategories = [{ id: 'transport', label: 'Komunikacja' }];
        api.get.mockResolvedValueOnce({ data: mockCategories });
        const result = await complaintService.getCategories();
        expect(api.get).toHaveBeenCalledWith('/api/complaints/categories');
        expect(result).toEqual(mockCategories);
    });

    // NOWOŚĆ: Test dla metody getAll, której brakowało
    it('getAll fetches all complaints from API', async () => {
        const mockComplaints = [{ id: 1, title: 'Zgłoszenie' }];
        api.get.mockResolvedValueOnce({ data: mockComplaints });
        const result = await complaintService.getAll();
        expect(api.get).toHaveBeenCalledWith('/api/complaints');
        expect(result).toEqual(mockComplaints);
    });

    it('create sends complaint data to API', async () => {
        const payload = { title: 'Dziura', category: 'roads' };
        api.post.mockResolvedValueOnce({ data: { id: 99, ...payload } });
        const result = await complaintService.create(payload);
        expect(api.post).toHaveBeenCalledWith('/api/complaints', payload);
        expect(result.id).toBe(99);
    });

    it('addAttachment sends FormData with correct headers', async () => {
        api.post.mockResolvedValueOnce({ data: { success: true } });
        const mockFile = new File([''], 'photo.jpg', { type: 'image/jpeg' });
        await complaintService.addAttachment(123, mockFile);
        expect(api.post).toHaveBeenCalledWith(
            '/api/complaints/123/attachments',
            expect.any(FormData),
            { headers: { 'Content-Type': 'multipart/form-data' } }
        );
    });

    // NOWOŚĆ: Test ścieżki błędu (obsługa bloku catch)
    it('handles API errors gracefully in getCategories', async () => {
        api.get.mockRejectedValueOnce(new Error('Network Error'));
        await expect(complaintService.getCategories()).rejects.toThrow('Network Error');
    });
});