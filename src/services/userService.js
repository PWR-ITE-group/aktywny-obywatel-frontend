import api from '../config/api';

const USE_MOCK = true;
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const MOCK_USER = {
  email: 'user@example.com',
  firstName: 'Jan',
  lastName: 'Kowalski',
  phone: '123456789',
};

export const userService = {
  async updateProfile(data) {
    if (USE_MOCK) {
      await delay(500);
      // Update mock user (in real app would persist)
      Object.assign(MOCK_USER, data);
      return { success: true, data: MOCK_USER };
    }
    const { data: responseData } = await api.put('/api/users/profile', data);
    return responseData;
  },

  async changePassword(currentPassword, newPassword) {
    if (USE_MOCK) {
      await delay(500);
      // In mock, just accept
      return { success: true };
    }
    const { data } = await api.put('/api/users/password', {
      currentPassword,
      newPassword,
    });
    return data;
  },

  async updateNotificationPreferences(preferences) {
    if (USE_MOCK) {
      await delay(500);
      return { success: true };
    }
    const { data } = await api.put('/api/users/notifications', preferences);
    return data;
  },

  async requestAccountDeletion() {
    if (USE_MOCK) {
      await delay(500);
      return { success: true };
    }
    const { data } = await api.delete('/api/users/account');
    return data;
  },
};