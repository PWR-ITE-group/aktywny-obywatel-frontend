import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from '../authService';
import api from '../../config/api';

// Mock the axios instance
vi.mock('../../config/api', () => {
  return {
    default: {
      post: vi.fn(),
      get: vi.fn()
    }
  };
});

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should successfully log in a user and return the data object', async () => {
      const mockResponse = { token: 'fake-jwt', email: 'test@example.com', role: 'user' };
      api.post.mockResolvedValueOnce({ data: mockResponse });

      const result = await authService.login('test@example.com', 'password123');

      expect(api.post).toHaveBeenCalledWith('/api/auth/login', {
        email: 'test@example.com',
        password: 'password123'
      });
      expect(result).toEqual(mockResponse);
    });

    it('should return token object if API responds with string token directly', async () => {
      const mockTokenString = 'just-a-raw-token';
      api.post.mockResolvedValueOnce({ data: mockTokenString });

      const result = await authService.login('test@example.com', 'password123');
      expect(result).toEqual({ token: mockTokenString });
    });
  });

  describe('register', () => {
    it('should send the correct payload to the register endpoint', async () => {
      const mockResponse = { verificationToken: 'mock-verification-token' };
      api.post.mockResolvedValueOnce({ data: mockResponse });

      const result = await authService.register(
        'new@example.com',
        'Pass123!',
        '+48123456789',
        'John',
        'Doe'
      );

      expect(api.post).toHaveBeenCalledWith('/api/auth/register', {
        email: 'new@example.com',
        password: 'Pass123!',
        phoneNumber: '+48123456789',
        firstName: 'John',
        lastName: 'Doe'
      });
      expect(result).toEqual(mockResponse);
    });
  });
});
