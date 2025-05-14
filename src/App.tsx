
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import NotFound from '@/pages/NotFound';
import ProtectedRoute from '@/components/ProtectedRoute';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Router from './routes';

// Main App component
function App() {
  return (
    <AuthProvider>
      {/* Use Router component that defines all routes */}
      <Router />
      {/* Toaster should be placed here, outside of routes but inside AuthProvider */}
      <Toaster />
    </AuthProvider>
  );
}

export default App;
