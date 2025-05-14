
import React from 'react';
import { Route } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import Dashboard from '@/components/Dashboard';
import StudentPacks from '@/components/StudentPacks';
import CourseManagement from '@/components/admin/CourseManagement';
import CourseMaterials from '@/components/admin/CourseMaterials';
import InvoiceManagement from '@/components/admin/InvoiceManagement';

interface StudentRoutesProps {
  userId?: string;
}

const StudentRoutes: React.FC<StudentRoutesProps> = ({ userId }) => {
  return (
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
            <StudentPacks studentId={userId} />
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
  );
};

export default StudentRoutes;
