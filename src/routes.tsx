
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

// Error fallback component
const RouterErrorFallback = () => (
  <div className="flex items-center justify-center min-h-screen p-4">
    <div className="max-w-md w-full bg-card border border-border p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold text-destructive mb-4">Navigation Error</h2>
      <p className="text-muted-foreground mb-6">
        There was a problem loading this route. This could be due to a temporary issue or invalid route configuration.
      </p>
      <div className="flex flex-col gap-2">
        <button
          onClick={() => window.location.reload()}
          className="w-full px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
        >
          Reload Page
        </button>
        <button
          onClick={() => window.location.href = '/'}
          className="w-full px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/90"
        >
          Go to Homepage
        </button>
      </div>
    </div>
  </div>
);

// Role-based redirect component
const RoleBasedRedirect: React.FC = () => {
  const { userRole, isLoading } = useAuth();
  
  console.log('RoleBasedRedirect: userRole =', userRole, 'isLoading =', isLoading);
  
  if (isLoading) return <LoadingFallback />;
  
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
    <ErrorBoundary fallback={<RouterErrorFallback />}>
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
            <ErrorBoundary fallback={<RouterErrorFallback />}>
              <Layout />
            </ErrorBoundary>
          }>
            <Route index element={user ? <Index /> : <Navigate to="/login" replace />} />
            
            {/* Role-based routes - conditionally rendered based on user role */}
            {user && userRole === 'admin' && <AdminRoutes userId={user?.id} />}
            {user && userRole === 'teacher' && <TeacherRoutes userId={user?.id} />}
            {user && userRole === 'student' && <StudentRoutes userId={user?.id} />}
            
            {/* Fallback route for unknown paths within the authenticated area */}
            <Route path="*" element={
              <div className="p-8">
                <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
                <p className="text-muted-foreground mb-6">
                  Sorry, the page you are looking for does not exist in this section.
                </p>
                <button
                  onClick={() => window.history.back()}
                  className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
                >
                  Go Back
                </button>
              </div>
            } />
          </Route>
          
          {/* Global fallback route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
