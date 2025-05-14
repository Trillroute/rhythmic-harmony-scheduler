
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/Layout'; // Changed from named import to default import
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import NotFound from '@/pages/NotFound';
import ProtectedRoute from '@/components/ProtectedRoute';
import SeedDatabase from '@/pages/SeedDatabase';
import AdminDashboard from '@/components/admin/AdminDashboard';
import UserManagement from '@/components/admin/UserManagement';
import SystemSettings from '@/components/admin/SystemSettings';
import ReportingDashboard from '@/components/admin/ReportingDashboard';
import StudentManagement from '@/components/admin/StudentManagement';
import CourseManagement from '@/components/admin/CourseManagement';
import CourseMaterials from '@/components/admin/CourseMaterials';
import InvoiceManagement from '@/components/admin/InvoiceManagement';
import BulkUploadPage from '@/components/admin/BulkUploadPage';
import AdvancedScheduler from '@/components/admin/AdvancedScheduler';
import { Dashboard } from '@/pages/Dashboard';
import TeacherDashboard from '@/pages/teacher/TeacherDashboard';
import TeacherStudents from '@/pages/teacher/TeacherStudents';
import TeacherMaterials from '@/pages/teacher/TeacherMaterials';
import StudentDashboard from '@/pages/student/StudentDashboard';
import StudentPacks from '@/components/StudentPacks';
import StudentCourses from '@/pages/student/StudentCourses';
import StudentResources from '@/pages/student/StudentResources';
import StudentPayments from '@/pages/student/StudentPayments';
import SessionScheduler from '@/components/SessionScheduler';
import AttendanceTracker from '@/components/AttendanceTracker';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/404" element={<NotFound />} />
      
      {/* Layout wrapped routes */}
      <Route element={<Layout />}>
        {/* Default route redirect */}
        <Route path="/" element={
          <ProtectedRoute>
            <Navigate to="/dashboard" replace />
          </ProtectedRoute>
        } />
        
        {/* General dashboard (redirects based on role) */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        
        {/* Admin routes */}
        <Route path="/admin" element={
          <ProtectedRoute requiredRole="admin">
            <Navigate to="/admin/dashboard" replace />
          </ProtectedRoute>
        } />
        <Route path="/admin/dashboard" element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute requiredRole="admin">
            <UserManagement />
          </ProtectedRoute>
        } />
        <Route path="/admin/settings" element={
          <ProtectedRoute requiredRole="admin">
            <SystemSettings />
          </ProtectedRoute>
        } />
        <Route path="/admin/reports" element={
          <ProtectedRoute requiredRole="admin">
            <ReportingDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/students" element={
          <ProtectedRoute requiredRole="admin">
            <StudentManagement />
          </ProtectedRoute>
        } />
        <Route path="/admin/courses" element={
          <ProtectedRoute requiredRole="admin">
            <CourseManagement />
          </ProtectedRoute>
        } />
        <Route path="/admin/materials" element={
          <ProtectedRoute requiredRole="admin">
            <CourseMaterials />
          </ProtectedRoute>
        } />
        <Route path="/admin/invoices" element={
          <ProtectedRoute requiredRole="admin">
            <InvoiceManagement />
          </ProtectedRoute>
        } />
        <Route path="/admin/bulk-upload" element={
          <ProtectedRoute requiredRole="admin">
            <BulkUploadPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/advanced-scheduler" element={
          <ProtectedRoute requiredRole="admin">
            <AdvancedScheduler />
          </ProtectedRoute>
        } />
        <Route path="/admin/seed-database" element={
          <ProtectedRoute requiredRole="admin">
            <SeedDatabase />
          </ProtectedRoute>
        } />

        {/* Teacher routes */}
        <Route path="/teacher" element={
          <ProtectedRoute requiredRole="teacher">
            <Navigate to="/teacher/dashboard" replace />
          </ProtectedRoute>
        } />
        <Route path="/teacher/dashboard" element={
          <ProtectedRoute requiredRole="teacher">
            <TeacherDashboard />
          </ProtectedRoute>
        } />
        <Route path="/teacher/scheduler" element={
          <ProtectedRoute requiredRole="teacher">
            <SessionScheduler />
          </ProtectedRoute>
        } />
        <Route path="/teacher/attendance" element={
          <ProtectedRoute requiredRole="teacher">
            <AttendanceTracker />
          </ProtectedRoute>
        } />
        <Route path="/teacher/students" element={
          <ProtectedRoute requiredRole="teacher">
            <TeacherStudents />
          </ProtectedRoute>
        } />
        <Route path="/teacher/materials" element={
          <ProtectedRoute requiredRole="teacher">
            <TeacherMaterials />
          </ProtectedRoute>
        } />

        {/* Student routes */}
        <Route path="/student" element={
          <ProtectedRoute requiredRole="student">
            <Navigate to="/student/dashboard" replace />
          </ProtectedRoute>
        } />
        <Route path="/student/dashboard" element={
          <ProtectedRoute requiredRole="student">
            <StudentDashboard />
          </ProtectedRoute>
        } />
        <Route path="/student/packs" element={
          <ProtectedRoute requiredRole="student">
            <StudentPacks />
          </ProtectedRoute>
        } />
        <Route path="/student/courses" element={
          <ProtectedRoute requiredRole="student">
            <StudentCourses />
          </ProtectedRoute>
        } />
        <Route path="/student/resources" element={
          <ProtectedRoute requiredRole="student">
            <StudentResources />
          </ProtectedRoute>
        } />
        <Route path="/student/payments" element={
          <ProtectedRoute requiredRole="student">
            <StudentPayments />
          </ProtectedRoute>
        } />
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};
