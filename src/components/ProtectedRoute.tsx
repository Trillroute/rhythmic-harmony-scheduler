
import React, { useEffect } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  allowedRoles?: UserRole[];
  requiredRole?: UserRole;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles,
  requiredRole
}) => {
  console.log('ProtectedRoute rendering', { requiredRole, allowedRoles });
  
  const { user, userRole, isLoading } = useAuth();
  const location = useLocation();
  const { toast } = useToast();
  
  // Use either requiredRole or allowedRoles
  const effectiveRoles = requiredRole ? [requiredRole] : allowedRoles;
  
  console.log('Auth state:', { user: !!user, userRole, isLoading });
  
  useEffect(() => {
    // If user is authenticated but doesn't have the required role, show a toast
    if (user && userRole && effectiveRoles && !effectiveRoles.includes(userRole)) {
      toast({
        title: "Access Denied",
        description: `You don't have permission to access this page.`,
        variant: "destructive"
      });
    }
  }, [user, userRole, effectiveRoles, toast]);
  
  if (isLoading) {
    console.log('Auth is loading');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Verifying your access...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    console.log('No user, redirecting to login');
    // Save the attempted URL to redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  if (effectiveRoles && userRole && !effectiveRoles.includes(userRole)) {
    console.log('User has incorrect role, redirecting to role dashboard');
    // If user doesn't have the required role, redirect to their role-specific dashboard
    const roleBasedPath = 
      userRole === 'admin' ? '/admin/dashboard' : 
      userRole === 'teacher' ? '/teacher/dashboard' : 
      userRole === 'student' ? '/student/dashboard' : 
      '/';
    
    return <Navigate to={roleBasedPath} replace />;
  }
  
  console.log('ProtectedRoute rendering children');
  return (
    <>
      {children}
      <Outlet />
    </>
  );
};

export default ProtectedRoute;
