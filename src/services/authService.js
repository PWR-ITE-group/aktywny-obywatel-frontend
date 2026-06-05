import api from '../config/api';
import { USE_MOCK } from '../config/mock';

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

export const authService = {
  async login(email, password) {
    if (USE_MOCK) {
      await delay(500);
      return {
        success: true,
        data: {
          email: email,
          role: email === 'admin@aktywnyobywatel.pl' ? 'admin' : 'user',
          token: 'mock-jwt-token-for-testing'
        }
      };
    }
    const { data } = await api.post('/api/auth/login', { email, password });
    return data;
  },

  async register(email, password, phoneNumber) {
    if (USE_MOCK) {
      await delay(500);
      return {
        success: true,
        data: {
          verificationToken: 'mock-verification-token'
        }
      };
    }
    const { data } = await api.post("/api/auth/register", {
      email: email, password: password, phoneNumber: phoneNumber
    });
    return data;
  },

  async requestPasswordReset(email) {
    if (USE_MOCK) {
      await delay(600);
      // Always return success to avoid user enumeration
      return { success: true };
    }
    const { data } = await api.post('/api/auth/request-password-reset', { email });
    return data;
  },

  async confirmPasswordReset(token, newPassword) {
    if (USE_MOCK) {
      await delay(600);
      return { success: true };
    }
    const { data } = await api.post(`/api/auth/confirm-password-reset?token=${token}`, { newPassword });
    return data;
  },
};