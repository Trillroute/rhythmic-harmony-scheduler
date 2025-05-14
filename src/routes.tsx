
import React, { Suspense } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import ProtectedRoute from '@/components/ProtectedRoute';

// Lazy load components to improve initial load time
const Login = React.lazy(() => import('@/pages/Login'));
const Signup = React.lazy(() => import('@/pages/Signup'));
const NotFound = React.lazy(() => import('@/pages/NotFound'));
const Index = React.lazy(() => import('@/pages/Index'));
const Layout = React.lazy(() => import('@/components/Layout'));
const AdminDashboard = React.lazy(() => import('@/components/admin/AdminDashboard'));
const UserManagement = React.lazy(() => import('@/components/admin/UserManagement'));
const SystemSettings = React.lazy(() => import('@/components/admin/SystemSettings'));
const ReportingDashboard = React.lazy(() => import('@/components/admin/ReportingDashboard'));
const DataExport = React.lazy(() => import('@/components/admin/DataExport'));
const Dashboard = React.lazy(() => import('@/components/Dashboard'));
const SessionScheduler = React.lazy(() => import('@/components/SessionScheduler'));
const AttendanceTracker = React.lazy(() => import('@/components/AttendanceTracker'));
const StudentPacks = React.lazy(() => import('@/components/StudentPacks'));
const CourseManagement = React.lazy(() => import('@/components/admin/CourseManagement'));
const SessionPlans = React.lazy(() => import('@/components/admin/SessionPlans'));
const InvoiceManagement = React.lazy(() => import('@/components/admin/InvoiceManagement'));
const CourseMaterials = React.lazy(() => import('@/components/admin/CourseMaterials'));
const AdvancedScheduler = React.lazy(() => import('@/components/admin/AdvancedScheduler'));
const StudentManagement = React.lazy(() => import('@/components/admin/StudentManagement'));

// Loading component for lazy-loaded routes
const RouteLoading = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

// Use Routes directly instead of createBrowserRouter
export default function Router() {
  const { user } = useAuth();
  
  return (
    <ErrorBoundary>
      <Suspense fallback={<RouteLoading />}>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify" element={<Login />} /> {/* Redirect verification to login page */}
          
          {/* Main layout routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Index />} />
            
            {/* Admin routes */}
            <Route path="admin">
              <Route 
                path="dashboard" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="users" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <UserManagement />
                  </ProtectedRoute>
                }
              />
              <Route 
                path="settings" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <SystemSettings />
                  </ProtectedRoute>
                }
              />
              <Route 
                path="reports" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <ReportingDashboard />
                  </ProtectedRoute>
                }
              />
              <Route 
                path="export" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <DataExport />
                  </ProtectedRoute>
                }
              />
              <Route 
                path="scheduler" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdvancedScheduler />
                  </ProtectedRoute>
                }
              />
              <Route 
                path="attendance" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AttendanceTracker teacherId={user?.id} />
                  </ProtectedRoute>
                }
              />
              <Route 
                path="packs" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <StudentPacks studentId={user?.id} />
                  </ProtectedRoute>
                }
              />
              <Route 
                path="courses" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <CourseManagement />
                  </ProtectedRoute>
                }
              />
              <Route 
                path="session-plans" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <SessionPlans />
                  </ProtectedRoute>
                }
              />
              <Route 
                path="invoices" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <InvoiceManagement />
                  </ProtectedRoute>
                }
              />
              <Route 
                path="materials" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <CourseMaterials />
                  </ProtectedRoute>
                }
              />
              <Route 
                path="students" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <StudentManagement />
                  </ProtectedRoute>
                }
              />
            </Route>
            
            {/* Teacher routes */}
            <Route path="teacher">
              <Route 
                path="dashboard" 
                element={
                  <ProtectedRoute requiredRole="teacher">
                    <Dashboard userRole="teacher" />
                  </ProtectedRoute>
                }
              />
              <Route 
                path="scheduler" 
                element={
                  <ProtectedRoute requiredRole="teacher">
                    <SessionScheduler />
                  </ProtectedRoute>
                }
              />
              <Route 
                path="attendance" 
                element={
                  <ProtectedRoute requiredRole="teacher">
                    <AttendanceTracker teacherId={user?.id} />
                  </ProtectedRoute>
                }
              />
              <Route 
                path="students" 
                element={
                  <ProtectedRoute requiredRole="teacher">
                    <StudentManagement />
                  </ProtectedRoute>
                }
              />
              <Route 
                path="materials" 
                element={
                  <ProtectedRoute requiredRole="teacher">
                    <CourseMaterials />
                  </ProtectedRoute>
                }
              />
            </Route>
            
            {/* Student routes */}
            <Route path="student">
              <Route 
                path="dashboard" 
                element={
                  <ProtectedRoute requiredRole="student">
                    <Dashboard userRole="student" />
                  </ProtectedRoute>
                }
              />
              <Route 
                path="packs" 
                element={
                  <ProtectedRoute requiredRole="student">
                    <StudentPacks studentId={user?.id} />
                  </ProtectedRoute>
                }
              />
              <Route 
                path="courses" 
                element={
                  <ProtectedRoute requiredRole="student">
                    <CourseManagement />
                  </ProtectedRoute>
                }
              />
              <Route 
                path="resources" 
                element={
                  <ProtectedRoute requiredRole="student">
                    <CourseMaterials />
                  </ProtectedRoute>
                }
              />
              <Route 
                path="payments" 
                element={
                  <ProtectedRoute requiredRole="student">
                    <InvoiceManagement />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Route>
          
          {/* Fallback route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
