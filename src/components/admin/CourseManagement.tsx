
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const CourseManagement: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Course Management</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Manage Courses</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Course management interface will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseManagement;
