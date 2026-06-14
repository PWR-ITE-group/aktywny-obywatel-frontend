import api from '../config/api';

const USE_MOCK = false;
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const MOCK_USER = {
  id: 1,
  email: 'user@example.com',
  firstName: 'Jan',
  lastName: 'Kowalski',
  phone: '123456789',
};

export const userService = {
  async getCurrentProfile() {
    if (USE_MOCK) {
      await delay(300);
      return MOCK_USER;
    }
    const { data } = await api.get('/api/users/profile');
    return data;
  },

  async updateProfile(data) {
    if (USE_MOCK) {
      await delay(500);
      // Update mock user (in real app would persist)
      Object.assign(MOCK_USER, data);
      return MOCK_USER;
    }
    const { data: responseData } = await api.put('/api/users/profile', data);
    return responseData;
  },

  async changePassword(currentPassword, newPassword) {
    if (USE_MOCK) {
      await delay(500);
      // In mock, just accept
      return {};
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
      return {};
    }
    const { data } = await api.put('/api/users/notifications', preferences);
    return data;
  },

  async requestAccountDeletion() {
    if (USE_MOCK) {
      await delay(500);
      return {};
    }
    const { data } = await api.delete('/api/users/account');
    return data;
  },
};