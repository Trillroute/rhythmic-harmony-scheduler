import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import NotFound from '@/pages/NotFound';
import ProtectedRoute from '@/components/ProtectedRoute';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

// Create a client
const queryClient = new QueryClient();

// Wrapper component to redirect authenticated users based on their role
const RoleBasedRedirect: React.FC = () => {
  const { userRole, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not logged in, show the index page
  if (!user) {
    return <Index />;
  }

  // Otherwise, redirect to the appropriate dashboard
  switch (userRole) {
    case 'admin':
      return <Navigate to="/admin/dashboard" replace />;
    case 'teacher':
      return <Navigate to="/teacher/dashboard" replace />;
    case 'student':
      return <Navigate to="/student/dashboard" replace />;
    default:
      return <Navigate to="/dashboard" replace />;
  }
};

// Main App component
function App() {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <Router>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/verify" element={<Login />} /> {/* Redirect verification to login page */}
              
              {/* Main index route that redirects based on role */}
              <Route path="/" element={<RoleBasedRedirect />} />
              
              {/* Role-specific dashboard routes */}
              <Route 
                path="/admin/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Index />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/teacher/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['teacher']}>
                    <Index />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/student/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <Index />
                  </ProtectedRoute>
                } 
              />
              
              {/* Fallback dashboard for any authenticated user */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                } 
              />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </AuthProvider>
        </Router>
      </QueryClientProvider>
    </React.StrictMode>
  );
}

export default App;
