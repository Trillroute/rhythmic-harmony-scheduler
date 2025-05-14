
import React from 'react';
import Layout from '@/components/Layout';
import Dashboard from '@/components/Dashboard';
import SessionScheduler from '@/components/SessionScheduler';
import AttendanceTracker from '@/components/AttendanceTracker';
import StudentPacks from '@/components/StudentPacks';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const Index: React.FC = () => {
  const { userRole, user } = useAuth();
  
  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">
          {userRole === 'admin' && 'Admin Dashboard'}
          {userRole === 'teacher' && 'Teacher Dashboard'}
          {userRole === 'student' && 'Student Dashboard'}
        </h1>
        
        <Tabs defaultValue="dashboard">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-4 lg:w-1/2">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="scheduler">Schedule</TabsTrigger>
            
            {userRole === 'admin' || userRole === 'teacher' ? (
              <TabsTrigger value="attendance">Attendance</TabsTrigger>
            ) : (
              <TabsTrigger value="my-packs">My Packs</TabsTrigger>
            )}
            
            {userRole === 'admin' && (
              <TabsTrigger value="admin">Admin</TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="dashboard" className="pt-4">
            <ErrorBoundary componentName="Dashboard">
              <Dashboard userRole={userRole!} />
            </ErrorBoundary>
          </TabsContent>
          
          <TabsContent value="scheduler" className="pt-4">
            <ErrorBoundary componentName="Session Scheduler">
              <SessionScheduler />
            </ErrorBoundary>
          </TabsContent>
          
          <TabsContent value="attendance" className="pt-4">
            {(userRole === 'admin' || userRole === 'teacher') && (
              <ErrorBoundary componentName="Attendance Tracker">
                <AttendanceTracker />
              </ErrorBoundary>
            )}
          </TabsContent>
          
          <TabsContent value="my-packs" className="pt-4">
            {userRole === 'student' && (
              <ErrorBoundary componentName="Student Packs">
                <StudentPacks studentId={user?.id} />
              </ErrorBoundary>
            )}
          </TabsContent>
          
          <TabsContent value="admin" className="pt-4">
            {userRole === 'admin' && (
              <ErrorBoundary componentName="Admin Tools">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-medium mb-4">User Management</h3>
                    <p>Admin tools for managing users will go here.</p>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-medium mb-4">System Settings</h3>
                    <p>Settings for the entire system will go here.</p>
                  </div>
                </div>
              </ErrorBoundary>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Index;
