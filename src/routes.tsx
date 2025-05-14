
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

// Create a wrapper component that applies ErrorBoundary
const withErrorBoundary = (Component: React.ComponentType<any>) => {
  return (props: any) => (
    <ErrorBoundary>
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
        element: <ProtectedRoute>{withErrorBoundary(Dashboard)({})}</ProtectedRoute>,
      },
      {
        path: "scheduler",
        element: <ProtectedRoute>{withErrorBoundary(SessionScheduler)({})}</ProtectedRoute>,
      },
      {
        path: "attendance",
        element: <ProtectedRoute>{withErrorBoundary(AttendanceTracker)({})}</ProtectedRoute>,
      },
      {
        path: "packs",
        element: <ProtectedRoute>{withErrorBoundary(StudentPacks)({})}</ProtectedRoute>,
      },
      {
        path: "admin",
        element: <ProtectedRoute>{withErrorBoundary(AdminDashboard)({})}</ProtectedRoute>,
        children: [
          { index: true, element: withErrorBoundary(ReportingDashboard)({}) },
          { path: "users", element: withErrorBoundary(UserManagement)({}) },
          { path: "students", element: withErrorBoundary(StudentManagement)({}) },
          { path: "students/:studentId", element: withErrorBoundary(StudentProfile)({}) },
          { path: "courses", element: withErrorBoundary(CourseManagement)({}) },
          { path: "plans", element: withErrorBoundary(SessionPlans)({}) },
          { path: "scheduler", element: withErrorBoundary(AdvancedScheduler)({}) },
          { path: "invoices", element: withErrorBoundary(InvoiceManagement)({}) },
          { path: "materials", element: withErrorBoundary(CourseMaterials)({}) },
          { path: "export", element: withErrorBoundary(DataExport)({}) },
          { path: "settings", element: withErrorBoundary(SystemSettings)({}) },
          { path: "bulk-upload", element: withErrorBoundary(BulkUploadPage)({}) }
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
