import api from './api';

const adminService = {
  // Get admin dashboard stats
  getStats: async () => {
    try {
      const response = await api.get('/admin/stats');
      return response.data; // ApiResponse<Map> with totalUsers, totalPredictions, newUsersThisMonth, etc.
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to fetch admin stats' };
    }
  },

  // Get global disease distribution
  getDiseaseDistribution: async () => {
    try {
      const response = await api.get('/admin/stats/disease-distribution');
      return response.data; // ApiResponse<List<{disease, count}>>
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to fetch disease distribution' };
    }
  },

  // Get daily prediction counts for chart
  getDailyPredictions: async (days = 30) => {
    try {
      const response = await api.get(`/admin/stats/daily-predictions?days=${days}`);
      return response.data; // ApiResponse<List<{date, count}>>
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to fetch daily predictions' };
    }
  },

  // Get all users (paginated)
  getUsers: async (page = 0, size = 20) => {
    try {
      const response = await api.get(`/admin/users?page=${page}&size=${size}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to fetch users' };
    }
  },

  // Get user by ID
  getUserById: async (id) => {
    try {
      const response = await api.get(`/admin/users/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to fetch user' };
    }
  },

  // Create new user
  createUser: async (userData) => {
    try {
      const response = await api.post('/admin/users', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to create user' };
    }
  },

  // Update user
  updateUser: async (id, userData) => {
    try {
      const response = await api.put(`/admin/users/${id}`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to update user' };
    }
  },

  // Toggle user enabled/disabled status
  toggleUserStatus: async (id) => {
    try {
      const response = await api.put(`/admin/users/${id}/toggle-status`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to toggle user status' };
    }
  },

  // Change user role
  changeUserRole: async (id, role) => {
    try {
      const response = await api.put(`/admin/users/${id}/change-role?role=${role}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to change user role' };
    }
  },

  // Delete user
  deleteUser: async (id) => {
    try {
      const response = await api.delete(`/admin/users/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to delete user' };
    }
  },

  // Get recent predictions (admin view)
  getRecentPredictions: async () => {
    try {
      const response = await api.get('/admin/predictions');
      return response.data; // ApiResponse<List<PredictionResponse>>
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to fetch predictions' };
    }
  },
};

export default adminService;
