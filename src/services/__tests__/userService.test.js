// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { userService } from '../userService';
import api from '../../config/api';

vi.mock('../../config/api', () => ({
    default: {
        get: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
    },
}));

describe('userService (Real API)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('getCurrentProfile fetches profile information', async () => {
        const mockProfile = { email: 'user@example.com', firstName: 'Jan' };
        api.get.mockResolvedValueOnce({ data: mockProfile });
        const result = await userService.getCurrentProfile();
        expect(api.get).toHaveBeenCalledWith('/api/users/profile');
        expect(result).toEqual(mockProfile);
    });

    it('changePassword sends correct data via PUT', async () => {
        api.put.mockResolvedValueOnce({ data: { success: true } });
        const result = await userService.changePassword('oldPass', 'newPass');
        expect(api.put).toHaveBeenCalledWith('/api/users/password', {
            currentPassword: 'oldPass',
            newPassword: 'newPass',
        });
        expect(result).toEqual({ success: true });
    });

    it('requestAccountDeletion triggers DELETE request', async () => {
        api.delete.mockResolvedValueOnce({ data: { status: 'deleted' } });
        const result = await userService.requestAccountDeletion();
        expect(api.delete).toHaveBeenCalledWith('/api/users/account');
        expect(result).toEqual({ status: 'deleted' });
    });

    // NOWOŚĆ: Test ścieżki błędu rzucanego przez catch block profilu
    it('handles failure during profile fetching', async () => {
        api.get.mockRejectedValueOnce(new Error('Unauthorized'));
        await expect(userService.getCurrentProfile()).rejects.toThrow('Unauthorized');
    });
});