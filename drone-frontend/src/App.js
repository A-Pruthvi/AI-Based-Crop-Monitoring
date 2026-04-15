import React from 'react';
import { useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import AppRoutes from './routes/AppRoutes';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import useAuth from './hooks/useAuth';

// Layout component that handles authenticated vs public views
const AppLayout = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  // Public routes that don't need the sidebar/navbar
  const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
  const isPublicRoute = publicRoutes.includes(location.pathname);

  if (isPublicRoute || !user) {
    return <AppRoutes />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Navbar */}
      <Navbar />
      
      <div className="flex">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content */}
        <main className="flex-1 mt-16 min-h-[calc(100vh-4rem)] p-6 overflow-y-auto bg-slate-50 dark:bg-slate-900">
          <AppRoutes />
        </main>
      </div>
    </div>
  );
};

// Main App component with providers
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <AppLayout />
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
