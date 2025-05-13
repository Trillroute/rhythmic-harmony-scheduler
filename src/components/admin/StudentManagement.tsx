
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const StudentManagement: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Student Management</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Manage Students</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Student management interface will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentManagement;
