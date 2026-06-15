import api from '../config/api';

const useMock = () => localStorage.getItem('token') === 'mock.jwt.token';
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

export const adminService = {
  // Reports management
  async getAllReports(filters = {}) {
    if (useMock()) {
      await delay(500);
      // Return mock data from mapConfig
      const { MOCK_REPORTS, STATUS_LABELS, STATUS_COLORS, CATEGORIES } = await import('../config/mapConfig');
      let reports = [...MOCK_REPORTS];

      if (filters.status) {
        reports = reports.filter(r => r.status === filters.status);
      }
      if (filters.category) {
        reports = reports.filter(r => r.category === filters.category);
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        reports = reports.filter(r =>
          r.title.toLowerCase().includes(searchLower) ||
          r.description.toLowerCase().includes(searchLower)
        );
      }

      return reports.map(report => ({
        ...report,
        statusLabel: STATUS_LABELS[report.status] || report.status,
        statusColor: STATUS_COLORS[report.status] || '#9E9E9E'
      }));
    }
    const { data } = await api.get('/api/complaints', { params: filters });
    return data;
  },

  async updateReportStatus(id, newStatus) {
    if (useMock()) {
      await delay(500);
      return {};
    }
    const { data } = await api.put(`/api/admin/reports/${id}/status`, { status: newStatus });
    return data;
  },

  async exportReportsCSV(filters = {}) {
    if (useMock()) {
      await delay(500);
      return { csvContent: 'id,title,category,status,lat,lng,createdAt\n1,Test,Drogi i chodniki,złożone,51.1079,17.0385,2026-04-10' };
    }
    const { data } = await api.get('/api/admin/reports/export', {
      params: filters,
      responseType: 'blob'
    });
    return data;
  },

  // Routing management
  async getRoutingRules() {
    if (useMock()) {
      await delay(500);
      const { CATEGORIES } = await import('../config/mapConfig');
      return CATEGORIES.map(category => ({
        category,
        department: category === 'Drogi i chodniki' ? 'ZDiUM' : '',
        channel: 'api'
      }));
    }
    const { data } = await api.get('/api/admin/routing');
    return data;
  },

  async updateRoutingRules(rules) {
    if (useMock()) {
      await delay(500);
      return {};
    }
    const { data } = await api.put('/api/admin/routing', { rules });
    return data;
  },

  // Departments management
  async getDepartments() {
    if (useMock()) {
      await delay(500);
      return [
        { id: 1, name: 'ZDiUM', email: 'zdium@um.wroc.pl', apiUrl: 'https://mock-urzad.local/zdium' },
        { id: 2, name: 'ZZM', email: 'zzm@um.wroc.pl', apiUrl: '' },
        { id: 3, name: 'MPWiK', email: 'mpwik@um.wroc.pl', apiUrl: 'https://mock-urzad.local/mpwik' }
      ];
    }
    const { data } = await api.get('/api/admin/departments');
    return data;
  },

  async createDepartment(departmentData) {
    if (useMock()) {
      await delay(500);
      return { ...departmentData, id: Date.now() };
    }
    const { data } = await api.post('/api/admin/departments', departmentData);
    return data;
  },

  async updateDepartment(id, departmentData) {
    if (useMock()) {
      await delay(500);
      return {};
    }
    const { data } = await api.put(`/api/admin/departments/${id}`, departmentData);
    return data;
  },

  async deleteDepartment(id) {
    if (useMock()) {
      await delay(500);
      return {};
    }
    const { data } = await api.delete(`/api/admin/departments/${id}`);
    return data;
  },

  // Statistics
  async getStats() {
    if (useMock()) {
      await delay(500);
      const { MOCK_REPORTS, STATUS_LABELS } = await import('../config/mapConfig');

      const total = MOCK_REPORTS.length;
      const byStatus = {};
      MOCK_REPORTS.forEach(report => {
        byStatus[report.status] = (byStatus[report.status] || 0) + 1;
      });

      const byCategory = {};
      MOCK_REPORTS.forEach(report => {
        byCategory[report.category] = (byCategory[report.category] || 0) + 1;
      });

      return {
        total,
        byStatus: Object.entries(byStatus).map(([status, count]) => ({
          status,
          label: STATUS_LABELS[status] || status,
          count
        })),
        byCategory: Object.entries(byCategory).map(([category, count]) => ({
          category,
          count
        }))
      };
    }
    const { data } = await api.get('/api/analytics');
    
    // Map backend array to UI expected format
    const total = data.reduce((sum, item) => sum + item.totalComplaints, 0);
    
    return {
      total,
      byStatus: [], // Not supported by current backend API
      byCategory: data.map(item => ({
        category: item.category,
        count: item.totalComplaints,
        routed: item.totalRouted
      }))
    };
  },

  // Users management
  async getUsers(filters = {}) {
    if (useMock()) {
      await delay(500);
      return [
        { id: 1, email: 'jan.kowalski@aktywnyobywatel.pl', createdAt: '2026-01-15', reports: 3, role: 'user' },
        { id: 2, email: 'anna.nowak@aktywnyobywatel.pl', createdAt: '2026-02-08', reports: 0, role: 'user' },
        { id: 3, email: 'piotr.wojcik@aktywnyobywatel.pl', createdAt: '2026-03-22', reports: 7, role: 'user' },
        { id: 4, email: 'admin@aktywnyobywatel.pl', createdAt: '2026-01-01', reports: 0, role: 'admin' }
      ].filter(user => {
        if (filters.role && user.role !== filters.role) return false;
        return true;
      });
    }
    const { data } = await api.get('/api/admin/users', { params: filters });
    return data;
  },

  async deleteUser(id) {
    if (useMock()) {
      await delay(500);
      return {};
    }
    const { data } = await api.delete(`/api/admin/users/${id}`);
    return data;
  }
};