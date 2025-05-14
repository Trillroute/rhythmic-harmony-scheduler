
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import NotFound from './pages/NotFound';
import Index from './pages/Index';
import Login from './pages/Login';
import Signup from './pages/Signup';
import SeedDatabase from './pages/SeedDatabase';
import ProtectedRoute from './components/ProtectedRoute';
import AttendanceTracker from './components/AttendanceTracker';
import Dashboard from './components/Dashboard';
import SessionScheduler from './components/SessionScheduler';
import StudentPacks from './components/StudentPacks';

// Admin Components
import AdminDashboard from './components/admin/AdminDashboard';
import UserManagement from './components/admin/UserManagement';
import StudentManagement from './components/admin/StudentManagement';
import CourseManagement from './components/admin/CourseManagement';
import CourseMaterials from './components/admin/CourseMaterials';
import InvoiceManagement from './components/admin/InvoiceManagement';
import ReportingDashboard from './components/admin/ReportingDashboard';
import SystemSettings from './components/admin/SystemSettings';
import BulkUploadPage from './components/admin/BulkUploadPage';
import AdvancedScheduler from './components/admin/AdvancedScheduler';
import StudentProfile from './components/admin/students/StudentProfile';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <Index />
      },
      {
        path: "login",
        element: <Login />
      },
      {
        path: "signup",
        element: <Signup />
      },
      {
        path: "dashboard",
        element: <ProtectedRoute allowedRoles={["admin", "teacher", "student"]}><Dashboard /></ProtectedRoute>
      },
      {
        path: "attendance",
        element: <ProtectedRoute allowedRoles={["admin", "teacher"]}><AttendanceTracker /></ProtectedRoute>
      },
      {
        path: "schedule",
        element: <ProtectedRoute allowedRoles={["admin", "teacher", "student"]}><SessionScheduler /></ProtectedRoute>
      },
      {
        path: "packs",
        element: <ProtectedRoute allowedRoles={["admin", "student"]}><StudentPacks /></ProtectedRoute>
      },
      {
        path: "admin/dashboard",
        element: <ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>
      },
      {
        path: "admin/users",
        element: <ProtectedRoute allowedRoles={["admin"]}><UserManagement /></ProtectedRoute>
      },
      {
        path: "admin/students",
        element: <ProtectedRoute allowedRoles={["admin"]}><StudentManagement /></ProtectedRoute>
      },
      {
        path: "admin/students/:id",
        element: <ProtectedRoute allowedRoles={["admin"]}><StudentProfile /></ProtectedRoute>
      },
      {
        path: "admin/courses",
        element: <ProtectedRoute allowedRoles={["admin"]}><CourseManagement /></ProtectedRoute>
      },
      {
        path: "admin/materials",
        element: <ProtectedRoute allowedRoles={["admin", "teacher"]}><CourseMaterials /></ProtectedRoute>
      },
      {
        path: "admin/invoices",
        element: <ProtectedRoute allowedRoles={["admin"]}><InvoiceManagement /></ProtectedRoute>
      },
      {
        path: "admin/reports",
        element: <ProtectedRoute allowedRoles={["admin"]}><ReportingDashboard /></ProtectedRoute>
      },
      {
        path: "admin/settings",
        element: <ProtectedRoute allowedRoles={["admin"]}><SystemSettings /></ProtectedRoute>
      },
      {
        path: "admin/bulk-upload",
        element: <ProtectedRoute allowedRoles={["admin"]}><BulkUploadPage /></ProtectedRoute>
      },
      {
        path: "admin/advanced-scheduler",
        element: <ProtectedRoute allowedRoles={["admin"]}><AdvancedScheduler /></ProtectedRoute>
      },
      {
        path: "admin/seed-database",
        element: <ProtectedRoute allowedRoles={["admin"]}><SeedDatabase /></ProtectedRoute>
      }
    ]
  }
]);

export default function Routes() {
  return <RouterProvider router={router} />;
}
