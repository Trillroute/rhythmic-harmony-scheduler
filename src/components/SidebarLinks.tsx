
import React from "react";
import { NavLink } from "react-router-dom";
import { 
  HomeIcon, 
  CalendarIcon, 
  ClipboardCheckIcon, 
  PackageIcon,
  BookOpenIcon,
  FileTextIcon,
  CreditCardIcon,
  GraduationCapIcon,
  UsersIcon,
  UserGroupIcon
} from "lucide-react";
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
        
        <div className="pt-4 pb-2">
          <div className="px-3 text-xs font-semibold text-muted-foreground">Teaching</div>
        </div>
        
        <NavLink
          to="/teacher/students"
          className={({ isActive }) =>
            `flex items-center px-3 py-2 text-sm rounded-md ${
              isActive ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
            }`
          }
        >
          <UserGroupIcon className="mr-2 h-4 w-4" />
          My Students
        </NavLink>
        
        <NavLink
          to="/teacher/materials"
          className={({ isActive }) =>
            `flex items-center px-3 py-2 text-sm rounded-md ${
              isActive ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
            }`
          }
        >
          <FileTextIcon className="mr-2 h-4 w-4" />
          Course Materials
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
      
      <NavLink
        to="/student/courses"
        className={({ isActive }) =>
          `flex items-center px-3 py-2 text-sm rounded-md ${
            isActive ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
          }`
        }
      >
        <BookOpenIcon className="mr-2 h-4 w-4" />
        My Courses
      </NavLink>
      
      <NavLink
        to="/student/resources"
        className={({ isActive }) =>
          `flex items-center px-3 py-2 text-sm rounded-md ${
            isActive ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
          }`
        }
      >
        <FileTextIcon className="mr-2 h-4 w-4" />
        Learning Resources
      </NavLink>
      
      <NavLink
        to="/student/payments"
        className={({ isActive }) =>
          `flex items-center px-3 py-2 text-sm rounded-md ${
            isActive ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
          }`
        }
      >
        <CreditCardIcon className="mr-2 h-4 w-4" />
        Payments
      </NavLink>
    </div>
  );
};

export default SidebarLinks;
