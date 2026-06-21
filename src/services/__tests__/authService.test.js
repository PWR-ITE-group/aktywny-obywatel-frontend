import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from '../authService';
import api from '../../config/api';

describe('authService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('login', () => {
    it('should successfully log in a user and return data', async () => {
      const mockResponse = { token: 'fake-jwt', email: 'test@example.com' };
      vi.spyOn(api, 'post').mockResolvedValueOnce({ data: mockResponse });

      const result = await authService.login('test@example.com', 'password123');
      expect(result).toEqual(mockResponse);
    });

    it('should handle string tokens directly', async () => {
      vi.spyOn(api, 'post').mockResolvedValueOnce({ data: 'just-a-string-token' });

      const result = await authService.login('test@example.com', 'password123');
      expect(result).toEqual({ token: 'just-a-string-token' });
    });
  });

  describe('register', () => {
    it('should successfully register a user', async () => {
      const mockResponse = { success: true };
      vi.spyOn(api, 'post').mockResolvedValueOnce({ data: mockResponse });

      const result = await authService.register('new@example.com', 'Pass123!', '123', 'John', 'Doe');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('password reset', () => {
    it('should successfully request password reset', async () => {
      vi.spyOn(api, 'post').mockResolvedValueOnce({ data: { sent: true } });

      const result = await authService.requestPasswordReset('user@example.com');
      expect(result).toEqual({ sent: true });
    });

    it('should successfully confirm password reset', async () => {
      vi.spyOn(api, 'post').mockResolvedValueOnce({ data: { updated: true } });

      const result = await authService.confirmPasswordReset('token123', 'newPass');
      expect(result).toEqual({ updated: true });
    });
  });
});