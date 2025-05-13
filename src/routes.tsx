
import React from 'react';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import NotFound from '@/pages/NotFound';
import Index from '@/pages/Index';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminDashboard from '@/components/admin/AdminDashboard';
import UserManagement from '@/components/admin/UserManagement';
import SystemSettings from '@/components/admin/SystemSettings';
import ReportingDashboard from '@/components/admin/ReportingDashboard';
import DataExport from '@/components/admin/DataExport';
import Dashboard from '@/components/Dashboard';
import SessionScheduler from '@/components/SessionScheduler';
import AttendanceTracker from '@/components/AttendanceTracker';
import StudentPacks from '@/components/StudentPacks';
import CourseManagement from '@/components/admin/CourseManagement';
import SessionPlans from '@/components/admin/SessionPlans';
import InvoiceManagement from '@/components/admin/InvoiceManagement';
import CourseMaterials from '@/components/admin/CourseMaterials';
import AdvancedScheduler from '@/components/admin/AdvancedScheduler';
import StudentManagement from '@/components/admin/StudentManagement';

const routes = createBrowserRouter([
  {
    path: '/',
    element: <Layout><Index /></Layout>,
    children: [
      {
        index: true,
        element: <Index />,
      },
      // Admin routes
      {
        path: 'admin',
        element: <ProtectedRoute requiredRole="admin"><Layout><Outlet /></Layout></ProtectedRoute>,
        children: [
          {
            path: 'dashboard',
            element: <AdminDashboard />,
          },
          {
            path: 'users',
            element: <UserManagement />,
          },
          {
            path: 'settings',
            element: <SystemSettings />,
          },
          {
            path: 'reports',
            element: <ReportingDashboard />,
          },
          {
            path: 'export',
            element: <DataExport />,
          },
          {
            path: 'scheduler',
            element: <AdvancedScheduler />,
          },
          {
            path: 'attendance',
            element: <AttendanceTracker teacherId={undefined} />,
          },
          {
            path: 'packs',
            element: <StudentPacks studentId={undefined} />,
          },
          {
            path: 'courses',
            element: <CourseManagement />,
          },
          {
            path: 'session-plans',
            element: <SessionPlans />,
          },
          {
            path: 'invoices',
            element: <InvoiceManagement />,
          },
          {
            path: 'materials',
            element: <CourseMaterials />,
          },
          {
            path: 'students',
            element: <StudentManagement />,
          },
        ]
      },
      // Teacher routes
      {
        path: 'teacher',
        element: <ProtectedRoute requiredRole="teacher"><Layout><Outlet /></Layout></ProtectedRoute>,
        children: [
          {
            path: 'dashboard',
            element: <Dashboard userRole="teacher" />,
          },
          {
            path: 'scheduler',
            element: <SessionScheduler />,
          },
          {
            path: 'attendance',
            element: <AttendanceTracker teacherId={undefined} />,
          },
          {
            path: 'students',
            element: <div>My Students Component (Teacher View)</div>,
          },
          {
            path: 'materials',
            element: <div>Course Materials Component (Teacher View)</div>,
          }
        ]
      },
      // Student routes
      {
        path: 'student',
        element: <ProtectedRoute requiredRole="student"><Layout><Outlet /></Layout></ProtectedRoute>,
        children: [
          {
            path: 'dashboard',
            element: <Dashboard userRole="student" />,
          },
          {
            path: 'packs',
            element: <StudentPacks studentId={undefined} />,
          },
          {
            path: 'courses',
            element: <div>My Courses Component (Student View)</div>,
          },
          {
            path: 'resources',
            element: <div>Learning Resources Component (Student View)</div>,
          },
          {
            path: 'payments',
            element: <div>Payments Component (Student View)</div>,
          }
        ]
      }
    ]
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/signup',
    element: <Signup />,
  },
  {
    path: '*',
    element: <NotFound />,
  }
]);

export default function Router() {
  return <RouterProvider router={routes} />;
}
