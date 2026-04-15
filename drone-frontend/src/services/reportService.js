import api from './api';

const reportService = {
  // Generate a new report from prediction data in a date range
  generateReport: async (reportData) => {
    try {
      // reportData: { title, description, type, dateFrom, dateTo }
      const response = await api.post('/reports/generate', reportData);
      return response.data; // ApiResponse<Report>
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to generate report' };
    }
  },

  // Get reports for current user (paginated)
  getReports: async (page = 0, size = 10) => {
    try {
      const response = await api.get(`/reports?page=${page}&size=${size}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to fetch reports' };
    }
  },

  // Get all reports for current user (non-paginated)
  getAllReports: async () => {
    try {
      const response = await api.get('/reports/all');
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to fetch reports' };
    }
  },

  // Get report by ID
  getReportById: async (id) => {
    try {
      const response = await api.get(`/reports/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Report not found' };
    }
  },

  // Get reports by type (DAILY, WEEKLY, MONTHLY, CUSTOM, MANUAL)
  getReportsByType: async (type) => {
    try {
      const response = await api.get(`/reports/by-type/${type}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to fetch reports' };
    }
  },

  // Get total report count
  getReportCount: async () => {
    try {
      const response = await api.get('/reports/count');
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to fetch report count' };
    }
  },

  // Delete report
  deleteReport: async (id) => {
    try {
      const response = await api.delete(`/reports/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to delete report' };
    }
  },
};

export default reportService;
