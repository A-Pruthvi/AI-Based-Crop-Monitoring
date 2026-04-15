import api from './api';

const authService = {
  login: async (email, password) => {
    try {
      // Try demo login endpoint (no database required)
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8081/api';
      const demoResponse = await fetch(`${baseUrl}/auth/demo-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!demoResponse.ok) {
        throw new Error('Login failed');
      }

      const result = await demoResponse.json();
      
      if (result.success && result.token) {
        localStorage.setItem('authToken', result.token);
        localStorage.setItem('user', JSON.stringify({
          id: result.user?.id || 1,
          name: result.user?.name || 'User',
          email: result.user?.email || email,
          role: result.user?.role || 'FARMER',
        }));
        
        return { success: true, data: { token: result.token, ...result.user } };
      }
      
      return result;
    } catch (error) {
      const message = error.message || 'Login failed. Please check your credentials.';
      throw new Error(message);
    }
  },

  register: async (userData) => {
    try {
      // Try demo registration endpoint  
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8081/api';
      const demoResponse = await fetch(`${baseUrl}/auth/demo-register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userData.email,
          name: userData.name || 'User',
          password: userData.password,
        }),
      });

      if (!demoResponse.ok) {
        throw new Error('Registration failed');
      }

      const result = await demoResponse.json();
      
      if (result.success && result.token) {
        localStorage.setItem('authToken', result.token);
        localStorage.setItem('user', JSON.stringify({
          id: result.user?.id || 1,
          name: result.user?.name || userData.name,
          email: result.user?.email || userData.email,
          role: result.user?.role || 'FARMER',
        }));
        
        return { success: true, data: { token: result.token, ...result.user } };
      }
      
      return result;
    } catch (error) {
      const message = error.message || 'Registration failed. Please try again.';
      throw new Error(message);
    }
  },

  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('authToken');
  },

  getToken: () => {
    return localStorage.getItem('authToken');
  },
};

export default authService;
