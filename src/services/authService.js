import api from '../config/api';

const USE_MOCK = true;
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

export const authService = {
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