
import React from 'react';
import { Route } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import Dashboard from '@/components/Dashboard';
import SessionScheduler from '@/components/SessionScheduler';
import AttendanceTracker from '@/components/AttendanceTracker';
import StudentManagement from '@/components/admin/StudentManagement';
import CourseMaterials from '@/components/admin/CourseMaterials';

interface TeacherRoutesProps {
  userId?: string;
}

const TeacherRoutes: React.FC<TeacherRoutesProps> = ({ userId }) => {
  return (
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
            <AttendanceTracker teacherId={userId} />
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
  );
};

export default TeacherRoutes;
