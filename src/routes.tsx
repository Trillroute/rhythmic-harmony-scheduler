
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

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <Index /> },
      {
        path: "dashboard",
        element: <ProtectedRoute><Dashboard /></ProtectedRoute>,
      },
      {
        path: "scheduler",
        element: <ProtectedRoute><SessionScheduler /></ProtectedRoute>,
      },
      {
        path: "attendance",
        element: <ProtectedRoute><AttendanceTracker /></ProtectedRoute>,
      },
      {
        path: "packs",
        element: <ProtectedRoute><StudentPacks /></ProtectedRoute>,
      },
      {
        path: "admin",
        element: <ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>,
        children: [
          { index: true, element: <ReportingDashboard /> },
          { path: "users", element: <UserManagement /> },
          { path: "students", element: <StudentManagement /> },
          { path: "students/:studentId", element: <StudentProfile /> },
          { path: "courses", element: <CourseManagement /> },
          { path: "plans", element: <SessionPlans /> },
          { path: "scheduler", element: <AdvancedScheduler /> },
          { path: "invoices", element: <InvoiceManagement /> },
          { path: "materials", element: <CourseMaterials /> },
          { path: "export", element: <DataExport /> },
          { path: "settings", element: <SystemSettings /> },
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
