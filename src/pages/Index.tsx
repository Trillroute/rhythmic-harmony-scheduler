
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import Dashboard from '@/components/Dashboard';
import AttendanceTracker from '@/components/AttendanceTracker';
import SessionScheduler from '@/components/SessionScheduler';
import StudentPacks from '@/components/StudentPacks';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/lib/types';

const Index = () => {
  // Get the user role from auth context
  const { userRole } = useAuth();
  
  // Role selection only for demo purposes (will default to actual user role)
  const [activeRole, setActiveRole] = useState<UserRole>(userRole || 'student');
  
  return (
    <Layout>
      <div className="mb-6">
        <div className="flex justify-end mb-8">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                activeRole === 'admin' ? 'bg-primary text-primary-foreground' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setActiveRole('admin')}
            >
              Admin View
            </button>
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium ${
                activeRole === 'teacher' ? 'bg-primary text-primary-foreground' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setActiveRole('teacher')}
            >
              Teacher View
            </button>
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                activeRole === 'student' ? 'bg-primary text-primary-foreground' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setActiveRole('student')}
            >
              Student View
            </button>
          </div>
        </div>
        
        {/* Display appropriate components based on role */}
        {activeRole === 'admin' && (
          <>
            <Dashboard userRole="admin" />
            <div className="mt-10">
              <SessionScheduler />
            </div>
          </>
        )}
        
        {activeRole === 'teacher' && (
          <>
            <Dashboard userRole="teacher" />
            <div className="mt-10">
              <AttendanceTracker />
            </div>
          </>
        )}
        
        {activeRole === 'student' && (
          <>
            <Dashboard userRole="student" />
            <div className="mt-10">
              <StudentPacks />
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Index;
