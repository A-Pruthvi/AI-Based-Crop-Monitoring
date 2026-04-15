import React, { createContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // On mount, check localStorage
  useEffect(() => {
    const stored = authService.getCurrentUser();
    if (stored && authService.isAuthenticated()) {
      setUser(stored);
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      await authService.login(email, password);
      const u = authService.getCurrentUser();
      setUser(u);
      return u;
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Login failed';
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  const register = useCallback(async (userData) => {
    setError(null);
    try {
      await authService.register(userData);
      const u = authService.getCurrentUser();
      setUser(u);
      return u;
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Registration failed';
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const isAdmin = useCallback(() => user?.role === 'ADMIN', [user]);
  const hasRole = useCallback((role) => user?.role === role, [user]);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      clearError,
      isAdmin,
      hasRole,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
