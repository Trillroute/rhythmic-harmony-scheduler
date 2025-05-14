
import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import NotFound from '@/pages/NotFound';
import Index from '@/pages/Index';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import AdminRoutes from './routes/adminRoutes';
import TeacherRoutes from './routes/teacherRoutes';
import StudentRoutes from './routes/studentRoutes';
import PublicRoutes from './routes/publicRoutes';
import { ErrorBoundary } from './components/ErrorBoundary';

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      <p className="text-muted-foreground">Loading application...</p>
    </div>
  </div>
);

// Role-based redirect component
const RoleBasedRedirect: React.FC = () => {
  const { userRole } = useAuth();
  
  console.log('RoleBasedRedirect: userRole =', userRole);
  
  switch(userRole) {
    case 'admin':
      return <Navigate to="/admin/dashboard" replace />;
    case 'teacher':
      return <Navigate to="/teacher/dashboard" replace />;
    case 'student':
      return <Navigate to="/student/dashboard" replace />;
    default:
      console.warn('No recognized user role found, redirecting to login');
      return <Navigate to="/login" replace />;
  }
};

// Use Routes directly instead of createBrowserRouter
export default function Router() {
  const { user, userRole, isLoading } = useAuth();
  
  console.log('Router: user =', user?.id, 'role =', userRole, 'isLoading =', isLoading);

  if (isLoading) {
    return <LoadingFallback />;
  }
  
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public routes */}
          <PublicRoutes />
          
          {/* Default route - redirect based on role */}
          <Route path="/" element={
            user ? <RoleBasedRedirect /> : <Navigate to="/login" replace />
          } />
          
          {/* Main layout routes */}
          <Route path="/" element={
            <ErrorBoundary>
              <Layout />
            </ErrorBoundary>
          }>
            <Route index element={user ? <Index /> : <Navigate to="/login" replace />} />
            
            {/* Role-based routes */}
            {user && userRole === 'admin' && <AdminRoutes userId={user?.id} />}
            {user && userRole === 'teacher' && <TeacherRoutes userId={user?.id} />}
            {user && userRole === 'student' && <StudentRoutes userId={user?.id} />}
          </Route>
          
          {/* Fallback route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
