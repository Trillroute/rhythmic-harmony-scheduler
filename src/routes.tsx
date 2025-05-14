
import React from 'react';
import { createBrowserRouter, useLocation } from 'react-router-dom';

// Layout
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import Index from './pages/Index';
import Login from './pages/Login';
import Signup from './pages/Signup';
import NotFound from './pages/NotFound';

// Admin components
import AdminDashboard from './components/admin/AdminDashboard';
import StudentManagement from './components/admin/StudentManagement';
import CourseManagement from './components/admin/CourseManagement';
import UserManagement from './components/admin/UserManagement';
import AdvancedScheduler from './components/admin/AdvancedScheduler';
import SessionPlans from './components/admin/SessionPlans';
import ReportingDashboard from './components/admin/ReportingDashboard';
import CourseMaterials from './components/admin/CourseMaterials';
import InvoiceManagement from './components/admin/InvoiceManagement';
import BulkUploadPage from './components/admin/BulkUploadPage';
import SystemSettings from './components/admin/SystemSettings';

// Data Population Utility
import PopulateTestData from './scripts/populate-test-data';

// Protected route
import ProtectedRoute from './components/ProtectedRoute';

// Components
import Dashboard from './components/Dashboard';
import SessionScheduler from './components/SessionScheduler';
import AttendanceTracker from './components/AttendanceTracker';

export default createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, element: <Index /> },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute allowedRoles={['admin', 'teacher', 'student']}>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'schedule',
        element: (
          <ProtectedRoute allowedRoles={['admin', 'teacher']}>
            <SessionScheduler />
          </ProtectedRoute>
        ),
      },
      {
        path: 'attendance',
        element: (
          <ProtectedRoute allowedRoles={['admin', 'teacher']}>
            <AttendanceTracker />
          </ProtectedRoute>
        ),
      },

      // Admin routes
      {
        path: 'admin',
        children: [
          {
            index: true,
            element: (
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            ),
          },
          {
            path: 'students',
            element: (
              <ProtectedRoute allowedRoles={['admin']}>
                <StudentManagement />
              </ProtectedRoute>
            ),
          },
          {
            path: 'courses',
            element: (
              <ProtectedRoute allowedRoles={['admin']}>
                <CourseManagement />
              </ProtectedRoute>
            ),
          },
          {
            path: 'users',
            element: (
              <ProtectedRoute allowedRoles={['admin']}>
                <UserManagement />
              </ProtectedRoute>
            ),
          },
          {
            path: 'schedule',
            element: (
              <ProtectedRoute allowedRoles={['admin']}>
                <AdvancedScheduler />
              </ProtectedRoute>
            ),
          },
          {
            path: 'plans',
            element: (
              <ProtectedRoute allowedRoles={['admin']}>
                <SessionPlans />
              </ProtectedRoute>
            ),
          },
          {
            path: 'packs',
            element: (
              <ProtectedRoute allowedRoles={['admin']}>
                <PopulateTestData />
              </ProtectedRoute>
            ),
          },
          {
            path: 'reports',
            element: (
              <ProtectedRoute allowedRoles={['admin']}>
                <ReportingDashboard />
              </ProtectedRoute>
            ),
          },
          {
            path: 'materials',
            element: (
              <ProtectedRoute allowedRoles={['admin']}>
                <CourseMaterials />
              </ProtectedRoute>
            ),
          },
          {
            path: 'invoices',
            element: (
              <ProtectedRoute allowedRoles={['admin']}>
                <InvoiceManagement />
              </ProtectedRoute>
            ),
          },
          {
            path: 'bulk-upload',
            element: (
              <ProtectedRoute allowedRoles={['admin']}>
                <BulkUploadPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'settings',
            element: (
              <ProtectedRoute allowedRoles={['admin']}>
                <SystemSettings />
              </ProtectedRoute>
            ),
          },
        ],
      },

      // Auth routes
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'signup',
        element: <Signup />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
]);

// Custom hook to access current location
export const useCurrentLocation = () => {
  const location = useLocation();
  return location;
};
