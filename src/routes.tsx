
import { createBrowserRouter } from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";
import Dashboard from "./components/Dashboard";
import SessionScheduler from "./components/SessionScheduler";
import AttendanceTracker from "./components/AttendanceTracker";
import StudentPacks from "./components/StudentPacks";
import ProtectedRoute from "./components/ProtectedRoute";
import UserManagement from "./components/admin/UserManagement";
import SystemSettings from "./components/admin/SystemSettings";
import ReportingDashboard from "./components/admin/ReportingDashboard";
import DataExport from "./components/admin/DataExport";
import AdminDashboard from "./components/admin/AdminDashboard";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <Index /> },
      { 
        path: "/login", 
        element: <Login /> 
      },
      { 
        path: "/signup", 
        element: <Signup /> 
      },
      
      // Protected Routes
      {
        path: "/teacher",
        element: <ProtectedRoute role="teacher" />,
        children: [
          { path: "dashboard", element: <Dashboard /> },
          { path: "scheduler", element: <SessionScheduler /> },
          { path: "attendance", element: <AttendanceTracker /> },
        ],
      },
      {
        path: "/student",
        element: <ProtectedRoute role="student" />,
        children: [
          { path: "dashboard", element: <Dashboard /> },
          { path: "packs", element: <StudentPacks /> },
        ],
      },
      {
        path: "/admin",
        element: <ProtectedRoute role="admin" />,
        children: [
          { path: "dashboard", element: <AdminDashboard /> },
          { path: "users", element: <UserManagement /> },
          { path: "settings", element: <SystemSettings /> },
          { path: "reports", element: <ReportingDashboard /> },
          { path: "export", element: <DataExport /> },
          { path: "scheduler", element: <SessionScheduler /> },
          { path: "attendance", element: <AttendanceTracker /> },
          { path: "packs", element: <StudentPacks /> },
        ],
      },
    ],
  },
]);
