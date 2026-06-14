import api from '../config/api';
//import { USE_MOCK } from '../config/mock';
const USE_MOCK = false;
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

export const authService = {
  async login(email, password) {
    if (USE_MOCK) {
      await delay(500);
      return {
        email: email,
        role: email === 'admin@aktywnyobywatel.pl' ? 'admin' : 'user',
        token: 'mock-jwt-token-for-testing'
      };
    }
    const { data } = await api.post('/api/auth/login', { email, password });
    return typeof data === 'string' ? { token: data } : data;
  },

  async register(email, password, phoneNumber, firstName, lastName) {
    if (USE_MOCK) {
      await delay(500);
      return {
        verificationToken: 'mock-verification-token'
      };
    }
    const { data } = await api.post("/api/auth/register", {
      email: email, password: password, phoneNumber: phoneNumber, firstName: firstName, lastName: lastName
    });
    return data;
  },

  async requestPasswordReset(email) {
    if (USE_MOCK) {
      await delay(600);
      // Always return success to avoid user enumeration
      return {};
    }
    const { data } = await api.post('/api/auth/request-password-reset', { email });
    return data;
  },

  async confirmPasswordReset(token, newPassword) {
    if (USE_MOCK) {
      await delay(600);
      return {};
    }
    const { data } = await api.post(`/api/auth/confirm-password-reset?token=${token}`, { newPassword });
    return data;
  },
};