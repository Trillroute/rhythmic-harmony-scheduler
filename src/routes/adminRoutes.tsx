
import React from 'react';
import { Route } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminDashboard from '@/components/admin/AdminDashboard';
import UserManagement from '@/components/admin/UserManagement';
import SystemSettings from '@/components/admin/SystemSettings';
import ReportingDashboard from '@/components/admin/ReportingDashboard';
import DataExport from '@/components/admin/DataExport';
import AdvancedScheduler from '@/components/admin/AdvancedScheduler';
import AttendanceTracker from '@/components/AttendanceTracker';
import StudentPacks from '@/components/StudentPacks';
import CourseManagement from '@/components/admin/CourseManagement';
import SessionPlans from '@/components/admin/SessionPlans';
import InvoiceManagement from '@/components/admin/InvoiceManagement';
import CourseMaterials from '@/components/admin/CourseMaterials';
import StudentManagement from '@/components/admin/StudentManagement';

interface AdminRoutesProps {
  userId?: string;
}

const AdminRoutes: React.FC<AdminRoutesProps> = ({ userId }) => {
  return (
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
            <AttendanceTracker teacherId={userId} />
          </ProtectedRoute>
        }
      />
      <Route 
        path="packs" 
        element={
          <ProtectedRoute requiredRole="admin">
            <StudentPacks studentId={userId} />
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
  );
};

export default AdminRoutes;
