
import React from "react";
import { NavLink } from "react-router-dom";
import {
  BarChartIcon,
  CalendarIcon,
  ClipboardCheckIcon,
  FileIcon,
  HomeIcon,
  SettingsIcon,
  UsersIcon,
  GraduationCapIcon,
  BookOpenIcon,
  CreditCardIcon,
  PackageIcon,
  FileTextIcon
} from "lucide-react";

const AdminLinks: React.FC = () => {
  return (
    <div className="space-y-1">
      <NavLink
        to="/admin/dashboard"
        className={({ isActive }) =>
          `flex items-center px-3 py-2 text-sm rounded-md ${
            isActive ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
          }`
        }
      >
        <HomeIcon className="mr-2 h-4 w-4" />
        Dashboard
      </NavLink>
      
      <NavLink
        to="/admin/users"
        className={({ isActive }) =>
          `flex items-center px-3 py-2 text-sm rounded-md ${
            isActive ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
          }`
        }
      >
        <UsersIcon className="mr-2 h-4 w-4" />
        User Management
      </NavLink>
      
      <NavLink
        to="/admin/reports"
        className={({ isActive }) =>
          `flex items-center px-3 py-2 text-sm rounded-md ${
            isActive ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
          }`
        }
      >
        <BarChartIcon className="mr-2 h-4 w-4" />
        Reports
      </NavLink>
      
      <NavLink
        to="/admin/scheduler"
        className={({ isActive }) =>
          `flex items-center px-3 py-2 text-sm rounded-md ${
            isActive ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
          }`
        }
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        Advanced Scheduler
      </NavLink>
      
      <NavLink
        to="/admin/attendance"
        className={({ isActive }) =>
          `flex items-center px-3 py-2 text-sm rounded-md ${
            isActive ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
          }`
        }
      >
        <ClipboardCheckIcon className="mr-2 h-4 w-4" />
        Attendance Tracker
      </NavLink>
      
      <div className="pt-4 pb-2">
        <div className="px-3 text-xs font-semibold text-muted-foreground">Academic</div>
      </div>
      
      <NavLink
        to="/admin/students"
        className={({ isActive }) =>
          `flex items-center px-3 py-2 text-sm rounded-md ${
            isActive ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
          }`
        }
      >
        <GraduationCapIcon className="mr-2 h-4 w-4" />
        Student Management
      </NavLink>
      
      <NavLink
        to="/admin/packs"
        className={({ isActive }) =>
          `flex items-center px-3 py-2 text-sm rounded-md ${
            isActive ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
          }`
        }
      >
        <PackageIcon className="mr-2 h-4 w-4" />
        Session Packs
      </NavLink>
      
      <NavLink
        to="/admin/courses"
        className={({ isActive }) =>
          `flex items-center px-3 py-2 text-sm rounded-md ${
            isActive ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
          }`
        }
      >
        <BookOpenIcon className="mr-2 h-4 w-4" />
        Course Management
      </NavLink>
      
      <NavLink
        to="/admin/session-plans"
        className={({ isActive }) =>
          `flex items-center px-3 py-2 text-sm rounded-md ${
            isActive ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
          }`
        }
      >
        <FileTextIcon className="mr-2 h-4 w-4" />
        Session Plans
      </NavLink>
      
      <NavLink
        to="/admin/materials"
        className={({ isActive }) =>
          `flex items-center px-3 py-2 text-sm rounded-md ${
            isActive ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
          }`
        }
      >
        <FileIcon className="mr-2 h-4 w-4" />
        Course Materials
      </NavLink>
      
      <NavLink
        to="/admin/invoices"
        className={({ isActive }) =>
          `flex items-center px-3 py-2 text-sm rounded-md ${
            isActive ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
          }`
        }
      >
        <CreditCardIcon className="mr-2 h-4 w-4" />
        Invoice Management
      </NavLink>
      
      <div className="pt-4 pb-2">
        <div className="px-3 text-xs font-semibold text-muted-foreground">System</div>
      </div>
      
      <NavLink
        to="/admin/export"
        className={({ isActive }) =>
          `flex items-center px-3 py-2 text-sm rounded-md ${
            isActive ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
          }`
        }
      >
        <FileIcon className="mr-2 h-4 w-4" />
        Data Export
      </NavLink>
      
      <NavLink
        to="/admin/settings"
        className={({ isActive }) =>
          `flex items-center px-3 py-2 text-sm rounded-md ${
            isActive ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
          }`
        }
      >
        <SettingsIcon className="mr-2 h-4 w-4" />
        System Settings
      </NavLink>
    </div>
  );
};

export default AdminLinks;
