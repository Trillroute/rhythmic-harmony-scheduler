
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./components/Dashboard";
import SessionScheduler from "./components/SessionScheduler";
import AttendanceTracker from "./components/AttendanceTracker";
import StudentPacks from "./components/StudentPacks";
import AdminDashboard from "./components/admin/AdminDashboard";
import UserManagement from "./components/admin/UserManagement";
import StudentManagement from "./components/admin/StudentManagement";
import StudentProfile from "./components/admin/students/StudentProfile";
import CourseManagement from "./components/admin/CourseManagement";
import SessionPlans from "./components/admin/SessionPlans";
import ReportingDashboard from "./components/admin/ReportingDashboard";
import AdvancedScheduler from "./components/admin/AdvancedScheduler";
import InvoiceManagement from "./components/admin/InvoiceManagement";
import CourseMaterials from "./components/admin/CourseMaterials";
import DataExport from "./components/admin/DataExport";
import SystemSettings from "./components/admin/SystemSettings";
import BulkUploadPage from "./components/admin/BulkUploadPage";
import { ErrorBoundary } from "./components/ErrorBoundary";

// Create a wrapper component that applies ErrorBoundary with component name
const withErrorBoundary = (Component: React.ComponentType<any>, componentName: string) => {
  return (props: any) => (
    <ErrorBoundary componentName={componentName}>
      <Component {...props} />
    </ErrorBoundary>
  );
};

// Main Routes component
export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        <Route path="/" element={<Layout />}>
          <Route index element={<Index />} />
          
          <Route path="dashboard" element={
            <ProtectedRoute>
              {withErrorBoundary(Dashboard, "Dashboard")({})}
            </ProtectedRoute>
          } />
          
          <Route path="scheduler" element={
            <ProtectedRoute>
              {withErrorBoundary(SessionScheduler, "Session Scheduler")({})}
            </ProtectedRoute>
          } />
          
          <Route path="attendance" element={
            <ProtectedRoute>
              {withErrorBoundary(AttendanceTracker, "Attendance Tracker")({})}
            </ProtectedRoute>
          } />
          
          <Route path="packs" element={
            <ProtectedRoute>
              {withErrorBoundary(StudentPacks, "Student Packs")({})}
            </ProtectedRoute>
          } />
          
          <Route path="admin" element={
            <ProtectedRoute>
              {withErrorBoundary(AdminDashboard, "Admin Dashboard")({})}
            </ProtectedRoute>
          }>
            <Route index element={withErrorBoundary(ReportingDashboard, "Reporting Dashboard")({})} />
            <Route path="users" element={withErrorBoundary(UserManagement, "User Management")({})} />
            <Route path="students" element={withErrorBoundary(StudentManagement, "Student Management")({})} />
            <Route path="students/:studentId" element={withErrorBoundary(StudentProfile, "Student Profile")({})} />
            <Route path="courses" element={withErrorBoundary(CourseManagement, "Course Management")({})} />
            <Route path="plans" element={withErrorBoundary(SessionPlans, "Session Plans")({})} />
            <Route path="reports" element={withErrorBoundary(ReportingDashboard, "Reporting Dashboard")({})} />
            <Route path="scheduler" element={withErrorBoundary(AdvancedScheduler, "Advanced Scheduler")({})} />
            <Route path="invoices" element={withErrorBoundary(InvoiceManagement, "Invoice Management")({})} />
            <Route path="materials" element={withErrorBoundary(CourseMaterials, "Course Materials")({})} />
            <Route path="export" element={withErrorBoundary(DataExport, "Data Export")({})} />
            <Route path="settings" element={withErrorBoundary(SystemSettings, "System Settings")({})} />
            <Route path="bulk-upload" element={withErrorBoundary(BulkUploadPage, "Bulk Upload")({})} />
            <Route path="session-plans" element={<Navigate to="/admin/plans" replace />} />
          </Route>
        </Route>
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
