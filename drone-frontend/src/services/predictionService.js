import api from './api';

// Helper to build image URL from backend imagePath
const buildImageUrl = (imagePath) => {
  if (!imagePath) return null;
  const baseUrl = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:8081';
  // Backend stores paths like "./uploads/1/filename.jpg" → serve from /uploads/1/filename.jpg
  return `${baseUrl}/${imagePath.replace('./', '')}`;
};

// Map backend PredictionResponse to frontend-friendly format
export const mapPrediction = (p) => ({
  id: p.id,
  userId: p.userId,
  imageUrl: buildImageUrl(p.imagePath),
  imagePath: p.imagePath,
  imageName: p.imageName,
  disease: p.diseaseName,
  diseaseName: p.diseaseName,
  confidence: p.confidenceScore,
  confidenceScore: p.confidenceScore,
  severity: p.severity,
  isHealthy: p.isHealthy,
  treatments: p.treatmentRecommendations || p.treatments || [],
  cropType: p.cropType,
  fieldLocation: p.fieldLocation,
  notes: p.notes,
  status: p.status,
  createdAt: p.createdAt,
  // New AI service fields
  detectedCrop: p.detectedCrop,
  plantHealthScore: p.plantHealthScore,
  heatmapUrl: p.heatmapUrl,
  cause: p.cause,
  prevention: p.prevention,
});

const predictionService = {
  // Upload image and get prediction via PUBLIC endpoint (no authentication required)
  analyzeCropImage: async (imageFile, metadata = {}) => {
    try {
      const formData = new FormData();
      formData.append('file', imageFile);
      if (metadata.cropType) formData.append('cropType', metadata.cropType);

      // Use PUBLIC endpoint - no JWT token needed
      const baseUrl = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:8081';
      const response = await fetch(`${baseUrl}/api/public/predict/analyze`, {
        method: 'POST',
        body: formData,
        timeout: 60000, // AI analysis may take longer
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      
      // Map AI Service response to expected format
      return {
        success: true,
        data: {
          diseaseName: data.disease,
          confidenceScore: data.disease_confidence,
          cropType: data.crop,
          treatmentRecommendations: [data.recommendation],
          isHealthy: data.disease === 'Healthy',
        }
      };
    } catch (error) {
      console.error('Analysis error:', error);
      return {
        success: false,
        message: error.message || 'Image analysis failed. Please try again.',
      };
    }
  },

  // Get all predictions for current user (paginated, with optional filters)
  getUserPredictions: async (page = 0, size = 10, filters = {}) => {
    try {
      const params = new URLSearchParams({ page, size });
      if (filters.search)    params.append('search', filters.search);
      if (filters.dateRange)  params.append('dateRange', filters.dateRange);
      if (filters.disease)    params.append('disease', filters.disease);
      if (filters.severity)   params.append('severity', filters.severity);
      const response = await api.get(`/predictions?${params.toString()}`);
      return response.data;
    } catch (error) {
      const message = error.userMessage || 'Failed to load predictions. Please try again.';
      throw new Error(message);
    }
  },

  // Get all predictions for current user (non-paginated)
  getAllUserPredictions: async () => {
    try {
      const response = await api.get('/predictions/all');
      return response.data;
    } catch (error) {
      const message = error.userMessage || 'Failed to load predictions.';
      throw new Error(message);
    }
  },

  // Get single prediction by ID
  getPredictionById: async (id) => {
    try {
      const response = await api.get(`/predictions/${id}`);
      return response.data;
    } catch (error) {
      const message = error.userMessage || 'Prediction not found.';
      throw new Error(message);
    }
  },

  // Delete prediction
  deletePrediction: async (id) => {
    try {
      const response = await api.delete(`/predictions/${id}`);
      return response.data;
    } catch (error) {
      const message = error.userMessage || 'Failed to delete prediction.';
      throw new Error(message);
    }
  },

  // Get prediction statistics for dashboard
  getPredictionStats: async () => {
    try {
      const response = await api.get('/predictions/stats');
      return response.data; // ApiResponse<PredictionStatsResponse>
    } catch (error) {
      const message = error.userMessage || 'Failed to load statistics.';
      throw new Error(message);
    }
  },

  // Get disease distribution data
  getDiseaseDistribution: async () => {
    try {
      const response = await api.get('/predictions/disease-distribution');
      return response.data; // ApiResponse<List<{disease, count}>>
    } catch (error) {
      const message = error.userMessage || 'Failed to load disease distribution.';
      throw new Error(message);
    }
  },

  // Get recent predictions for dashboard
  getRecentPredictions: async (limit = 5) => {
    try {
      const response = await api.get(`/predictions/recent?limit=${limit}`);
      return response.data; // ApiResponse<List<PredictionResponse>>
    } catch (error) {
      const message = error.userMessage || 'Failed to load recent predictions.';
      throw new Error(message);
    }
  },

  // Get predictions by date range
  getPredictionsByDateRange: async (startDate, endDate) => {
    try {
      const response = await api.get('/predictions/date-range', {
        params: { startDate, endDate },
      });
      return response.data;
    } catch (error) {
      const message = error.userMessage || 'Failed to load predictions for selected date range.';
      throw new Error(message);
    }
  },
};

export default predictionService;
