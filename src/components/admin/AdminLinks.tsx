
import { Link, useLocation } from 'react-router-dom';
import {
  User2,
  School2,
  BookOpen,
  FileSpreadsheet,
  BarChart3,
  Settings,
  Upload,
  Calendar,
  Users,
  Database
} from 'lucide-react';

const AdminLinks = () => {
  const { pathname } = useLocation();
  
  // Helper to check if a path is active
  const isActive = (path: string) => pathname === path;
  
  // Admin navigation links
  const links = [
    {
      to: '/admin/dashboard',
      icon: <BarChart3 className="h-5 w-5" />,
      label: 'Dashboard'
    },
    {
      to: '/admin/users',
      icon: <User2 className="h-5 w-5" />,
      label: 'User Management'
    },
    {
      to: '/admin/students',
      icon: <Users className="h-5 w-5" />,
      label: 'Student Management'
    },
    {
      to: '/admin/courses',
      icon: <School2 className="h-5 w-5" />,
      label: 'Course Management'
    },
    {
      to: '/admin/materials',
      icon: <BookOpen className="h-5 w-5" />,
      label: 'Course Materials'
    },
    {
      to: '/admin/invoices',
      icon: <FileSpreadsheet className="h-5 w-5" />,
      label: 'Invoice Management'
    },
    {
      to: '/admin/reports',
      icon: <BarChart3 className="h-5 w-5" />,
      label: 'Reporting'
    },
    {
      to: '/admin/settings',
      icon: <Settings className="h-5 w-5" />,
      label: 'System Settings'
    },
    {
      to: '/admin/bulk-upload',
      icon: <Upload className="h-5 w-5" />,
      label: 'Bulk Upload'
    },
    {
      to: '/admin/advanced-scheduler',
      icon: <Calendar className="h-5 w-5" />,
      label: 'Advanced Scheduler'
    },
    {
      to: '/admin/seed-database',
      icon: <Database className="h-5 w-5" />,
      label: 'Seed Database'
    }
  ];

  return (
    <div className="space-y-1">
      {links.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors hover:bg-accent hover:text-accent-foreground ${
            isActive(link.to) ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
          }`}
        >
          <span className="mr-3">{link.icon}</span>
          {link.label}
        </Link>
      ))}
    </div>
  );
};

export default AdminLinks;
