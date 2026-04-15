import axios from 'axios';

// Base API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8081/api';
const AI_SERVICE_URL = process.env.REACT_APP_AI_URL || 'http://localhost:5000/api';

// Create axios instance for Spring Boot backend
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Create axios instance for AI microservice
const aiApi = axios.create({
  baseURL: AI_SERVICE_URL,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
  timeout: 60000,
});

// Request interceptor - Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Helper to extract user-friendly error messages
const getErrorMessage = (error) => {
  // Network error (no response)
  if (!error.response) {
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return 'Request timeout. Please check your connection and try again.';
    }
    if (error.message === 'Network Error') {
      return 'Network error. Please check your internet connection.';
    }
    return 'Unable to connect to the server. Please try again later.';
  }

  // Extract message from response
  const response = error.response;
  const data = response.data;

  // API response with custom message
  if (data?.message) {
    return data.message;
  }

  // Standard HTTP error messages
  switch (response.status) {
    case 400:
      return 'Invalid request. Please check your input.';
    case 401:
      return 'Session expired. Please log in again.';
    case 403:
      return 'Access denied. You do not have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 409:
      return 'Conflict. This resource already exists.';
    case 422:
      return 'Validation failed. Please check your input.';
    case 429:
      return 'Too many requests. Please try again later.';
    case 500:
      return 'Server error. Please try again later.';
    case 502:
      return 'Bad gateway. The server is temporarily unavailable.';
    case 503:
      return 'Service unavailable. Please try again later.';
    default:
      return `An error occurred (${response.status}). Please try again.`;
  }
};

// Response interceptor - Handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Attach user-friendly message
    error.userMessage = getErrorMessage(error);

    if (error.response) {
      const requestUrl = error.config?.url || '';
      const isAuthEndpoint = requestUrl.includes('/auth/');

      switch (error.response.status) {
        case 401:
          // Don't redirect if this is a login/register attempt
          if (!isAuthEndpoint) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }
          break;
        case 403:
          console.error('Access denied:', error.userMessage);
          break;
        case 500:
          console.error('Server error:', error.userMessage);
          break;
        default:
          break;
      }
    } else {
      console.error('Network error:', error.userMessage);
    }

    return Promise.reject(error);
  }
);

// AI API interceptor
aiApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// AI API response interceptor
aiApi.interceptors.response.use(
  (response) => response,
  (error) => {
    error.userMessage = getErrorMessage(error);
    console.error('AI Service error:', error.userMessage);
    return Promise.reject(error);
  }
);

export { api, aiApi };
export default api;
