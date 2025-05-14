
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import NotFound from '@/pages/NotFound';
import Index from '@/pages/Index';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import AdminRoutes from './routes/adminRoutes';
import TeacherRoutes from './routes/teacherRoutes';
import StudentRoutes from './routes/studentRoutes';
import PublicRoutes from './routes/publicRoutes';

// Use Routes directly instead of createBrowserRouter
export default function Router() {
  const { user } = useAuth();
  
  return (
    <Routes>
      {/* Public routes */}
      <PublicRoutes />
      
      {/* Main layout routes */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Index />} />
        
        {/* Role-based routes */}
        <AdminRoutes userId={user?.id} />
        <TeacherRoutes userId={user?.id} />
        <StudentRoutes userId={user?.id} />
      </Route>
      
      {/* Fallback route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
