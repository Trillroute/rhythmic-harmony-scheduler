
import React from 'react';
import { CalendarCheck, Users, User, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { User as UserType, UserRole } from '@/lib/types';

interface SidebarProps {
  activeUser: UserType;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  collapsed: boolean;
  onClick?: () => void;
}

const NavItem = ({ icon, label, active = false, collapsed, onClick }: NavItemProps) => (
  <button
    className={cn(
      'flex items-center w-full px-3 py-3 rounded-lg transition-colors',
      active ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent/50',
      collapsed ? 'justify-center' : ''
    )}
    onClick={onClick}
  >
    <span className="flex items-center justify-center w-8 h-8">{icon}</span>
    {!collapsed && <span className="ml-3 whitespace-nowrap">{label}</span>}
  </button>
);

const Sidebar = ({ activeUser, collapsed, onToggleCollapse }: SidebarProps) => {
  const [activeTab, setActiveTab] = React.useState('dashboard');
  
  // Define navigation items based on user role
  const getNavItems = (role: UserRole) => {
    const items = [
      { id: 'dashboard', label: 'Dashboard', icon: <Clock /> },
      { id: 'schedule', label: 'Schedule', icon: <CalendarCheck /> },
    ];
    
    // Add role-specific items
    if (role === 'admin') {
      items.push({ id: 'teachers', label: 'Teachers', icon: <User /> });
      items.push({ id: 'students', label: 'Students', icon: <Users /> });
    }
    
    if (role === 'teacher') {
      items.push({ id: 'attendance', label: 'Attendance', icon: <CalendarCheck /> });
    }
    
    if (role === 'student') {
      items.push({ id: 'my-packs', label: 'My Packs', icon: <User /> });
    }
    
    return items;
  };
  
  const navItems = getNavItems(activeUser.role);
  
  return (
    <div className={cn(
      'h-screen flex flex-col bg-sidebar fixed top-0 left-0 z-40 transition-all duration-300 ease-in-out border-r border-sidebar-border',
      collapsed ? 'w-16' : 'w-64'
    )}>
      <div className="flex items-center justify-between p-4 h-16 border-b border-sidebar-border">
        {!collapsed && (
          <span className="text-lg font-semibold text-sidebar-foreground">
            Music School
          </span>
        )}
        <button 
          className="text-sidebar-foreground hover:text-sidebar-accent-foreground transition-colors ml-auto"
          onClick={onToggleCollapse}
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>
      
      <div className="flex flex-col flex-grow p-2 overflow-y-auto">
        {navItems.map(item => (
          <NavItem 
            key={item.id}
            icon={item.icon}
            label={item.label}
            collapsed={collapsed}
            active={activeTab === item.id}
            onClick={() => setActiveTab(item.id)}
          />
        ))}
      </div>
      
      <div className="p-4 border-t border-sidebar-border">
        <div className={cn(
          'flex items-center',
          collapsed ? 'justify-center' : ''
        )}>
          <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center text-sidebar-accent-foreground">
            {activeUser.name.charAt(0)}
          </div>
          {!collapsed && (
            <div className="ml-3">
              <div className="text-sm font-medium text-sidebar-foreground truncate">
                {activeUser.name}
              </div>
              <div className="text-xs text-sidebar-foreground/70 capitalize">
                {activeUser.role}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
