
import React from 'react';
import { cn } from '@/lib/utils';
import { UserRole } from '@/lib/types';
import SidebarLinks from './SidebarLinks';

interface SidebarProps {
  open: boolean;
  toggleSidebar: () => void;
  userRole: UserRole | null;
}

const Sidebar: React.FC<SidebarProps> = ({ open, toggleSidebar, userRole }) => {
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
            {userRole && <SidebarLinks role={userRole} />}
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
