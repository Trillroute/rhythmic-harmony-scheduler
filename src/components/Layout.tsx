
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { getActiveUser } from '@/lib/data';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const activeUser = getActiveUser();
  
  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar 
        activeUser={activeUser}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      <main className={cn(
        'flex-1 transition-all duration-300 ease-in-out',
        sidebarCollapsed ? 'ml-16' : 'ml-64'
      )}>
        <div className="h-16 border-b border-border flex items-center px-6">
          <h1 className="text-xl font-medium">Music School Manager</h1>
        </div>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
