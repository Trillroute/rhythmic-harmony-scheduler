
import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
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

// Use Routes directly instead of createBrowserRouter
export default function Router() {
  return (
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
                <AttendanceTracker teacherId={undefined} />
              </ProtectedRoute>
            }
          />
          <Route 
            path="packs" 
            element={
              <ProtectedRoute requiredRole="admin">
                <StudentPacks studentId={undefined} />
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
                <AttendanceTracker teacherId={undefined} />
              </ProtectedRoute>
            }
          />
          <Route 
            path="students" 
            element={
              <ProtectedRoute requiredRole="teacher">
                <div>My Students Component (Teacher View)</div>
              </ProtectedRoute>
            }
          />
          <Route 
            path="materials" 
            element={
              <ProtectedRoute requiredRole="teacher">
                <div>Course Materials Component (Teacher View)</div>
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
                <StudentPacks studentId={undefined} />
              </ProtectedRoute>
            }
          />
          <Route 
            path="courses" 
            element={
              <ProtectedRoute requiredRole="student">
                <div>My Courses Component (Student View)</div>
              </ProtectedRoute>
            }
          />
          <Route 
            path="resources" 
            element={
              <ProtectedRoute requiredRole="student">
                <div>Learning Resources Component (Student View)</div>
              </ProtectedRoute>
            }
          />
          <Route 
            path="payments" 
            element={
              <ProtectedRoute requiredRole="student">
                <div>Payments Component (Student View)</div>
              </ProtectedRoute>
            }
          />
        </Route>
      </Route>
      
      {/* Fallback route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
