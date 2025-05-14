
import { createBrowserRouter, RouterProvider } from "react-router-dom";
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

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <Index /> },
      {
        path: "dashboard",
        element: <ProtectedRoute>{withErrorBoundary(Dashboard, "Dashboard")({})}</ProtectedRoute>,
      },
      {
        path: "scheduler",
        element: <ProtectedRoute>{withErrorBoundary(SessionScheduler, "Session Scheduler")({})}</ProtectedRoute>,
      },
      {
        path: "attendance",
        element: <ProtectedRoute>{withErrorBoundary(AttendanceTracker, "Attendance Tracker")({})}</ProtectedRoute>,
      },
      {
        path: "packs",
        element: <ProtectedRoute>{withErrorBoundary(StudentPacks, "Student Packs")({})}</ProtectedRoute>,
      },
      {
        path: "admin",
        element: <ProtectedRoute>{withErrorBoundary(AdminDashboard, "Admin Dashboard")({})}</ProtectedRoute>,
        children: [
          { index: true, element: withErrorBoundary(ReportingDashboard, "Reporting Dashboard")({}) },
          { path: "users", element: withErrorBoundary(UserManagement, "User Management")({}) },
          { path: "students", element: withErrorBoundary(StudentManagement, "Student Management")({}) },
          { path: "students/:studentId", element: withErrorBoundary(StudentProfile, "Student Profile")({}) },
          { path: "courses", element: withErrorBoundary(CourseManagement, "Course Management")({}) },
          { path: "plans", element: withErrorBoundary(SessionPlans, "Session Plans")({}) },
          { path: "scheduler", element: withErrorBoundary(AdvancedScheduler, "Advanced Scheduler")({}) },
          { path: "invoices", element: withErrorBoundary(InvoiceManagement, "Invoice Management")({}) },
          { path: "materials", element: withErrorBoundary(CourseMaterials, "Course Materials")({}) },
          { path: "export", element: withErrorBoundary(DataExport, "Data Export")({}) },
          { path: "settings", element: withErrorBoundary(SystemSettings, "System Settings")({}) },
          { path: "bulk-upload", element: withErrorBoundary(BulkUploadPage, "Bulk Upload")({}) }
        ]
      }
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
]);

export default function Routes() {
  return <RouterProvider router={router} />;
}
