
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import NotFound from '@/pages/NotFound';
import Index from '@/pages/Index';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import AdminRoutes from './routes/adminRoutes';
import TeacherRoutes from './routes/teacherRoutes';
import StudentRoutes from './routes/studentRoutes';
import PublicRoutes from './routes/publicRoutes';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';

// Use Routes directly instead of createBrowserRouter
export default function Router() {
  console.log('Router component rendering');
  
  const { user } = useAuth();
  
  return (
    <Routes>
      {/* Public routes outside of Layout */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      
      {/* Main layout routes */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Index />} />
        
        {/* Role-based routes */}
        <AdminRoutes userId={user?.id} />
        <TeacherRoutes userId={user?.id} />
        <StudentRoutes userId={user?.id} />
        
        {/* Fallback route inside Layout */}
        <Route path="*" element={<NotFound />} />
      </Route>
      
      {/* Global fallback route */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}
