
import React from "react";
import { NavLink } from "react-router-dom";
import { HomeIcon, CalendarIcon, ClipboardCheckIcon, PackageIcon } from "lucide-react";
import { UserRole } from "@/lib/types";
import AdminLinks from "./admin/AdminLinks";

interface SidebarLinksProps {
  role: UserRole;
}

const SidebarLinks: React.FC<SidebarLinksProps> = ({ role }) => {
  // Render admin links
  if (role === 'admin') {
    return <AdminLinks />;
  }
  
  // Render teacher links
  if (role === 'teacher') {
    return (
      <div className="space-y-1">
        <NavLink
          to="/teacher/dashboard"
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
          to="/teacher/scheduler"
          className={({ isActive }) =>
            `flex items-center px-3 py-2 text-sm rounded-md ${
              isActive ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
            }`
          }
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          Session Scheduler
        </NavLink>
        <NavLink
          to="/teacher/attendance"
          className={({ isActive }) =>
            `flex items-center px-3 py-2 text-sm rounded-md ${
              isActive ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
            }`
          }
        >
          <ClipboardCheckIcon className="mr-2 h-4 w-4" />
          Attendance Tracker
        </NavLink>
      </div>
    );
  }
  
  // Render student links
  return (
    <div className="space-y-1">
      <NavLink
        to="/student/dashboard"
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
        to="/student/packs"
        className={({ isActive }) =>
          `flex items-center px-3 py-2 text-sm rounded-md ${
            isActive ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
          }`
        }
      >
        <PackageIcon className="mr-2 h-4 w-4" />
        My Packs
      </NavLink>
    </div>
  );
};

export default SidebarLinks;
