
import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, CheckSquare, Users, Package, UserCog, Home, BookOpen, Cog } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserRole } from '@/lib/types';

interface SidebarProps {
  open: boolean;
  toggleSidebar: () => void;
  userRole: UserRole | null;
}

const Sidebar: React.FC<SidebarProps> = ({ open, toggleSidebar, userRole }) => {
  // Define menu items based on role
  const getMenuItems = () => {
    const commonItems = [
      { 
        name: 'Dashboard', 
        icon: <Home className="h-5 w-5" />, 
        href: '/' 
      },
    ];
    
    const adminItems = [
      { 
        name: 'Session Scheduler', 
        icon: <Calendar className="h-5 w-5" />, 
        href: '/scheduler' 
      },
      { 
        name: 'Attendance', 
        icon: <CheckSquare className="h-5 w-5" />, 
        href: '/attendance' 
      },
      { 
        name: 'Teachers', 
        icon: <Users className="h-5 w-5" />, 
        href: '/teachers' 
      },
      { 
        name: 'Students', 
        icon: <UserCog className="h-5 w-5" />, 
        href: '/students' 
      },
      { 
        name: 'Session Packs', 
        icon: <Package className="h-5 w-5" />, 
        href: '/packs' 
      },
      { 
        name: 'Settings', 
        icon: <Cog className="h-5 w-5" />, 
        href: '/settings' 
      },
    ];
    
    const teacherItems = [
      { 
        name: 'My Schedule', 
        icon: <Calendar className="h-5 w-5" />, 
        href: '/schedule' 
      },
      { 
        name: 'Take Attendance', 
        icon: <CheckSquare className="h-5 w-5" />, 
        href: '/attendance' 
      },
      { 
        name: 'Students', 
        icon: <Users className="h-5 w-5" />, 
        href: '/students' 
      },
    ];
    
    const studentItems = [
      { 
        name: 'My Schedule', 
        icon: <Calendar className="h-5 w-5" />, 
        href: '/schedule' 
      },
      { 
        name: 'My Lessons', 
        icon: <BookOpen className="h-5 w-5" />, 
        href: '/lessons' 
      },
      { 
        name: 'My Packs', 
        icon: <Package className="h-5 w-5" />, 
        href: '/packs' 
      },
    ];
    
    switch(userRole) {
      case 'admin':
        return [...commonItems, ...adminItems];
      case 'teacher':
        return [...commonItems, ...teacherItems];
      case 'student':
        return [...commonItems, ...studentItems];
      default:
        return commonItems;
    }
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
      
      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-md transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b">
            <span className="text-xl font-semibold text-gray-800">Music School</span>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-3">
              {getMenuItems().map((item, index) => (
                <li key={index}>
                  <Link
                    to={item.href}
                    className="flex items-center px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100 hover:text-primary"
                  >
                    {item.icon}
                    <span className="ml-3">{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          
          {/* Footer */}
          <div className="p-4 text-sm text-gray-600 border-t">
            <p>Music School Admin</p>
            <p>v1.0.0</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
