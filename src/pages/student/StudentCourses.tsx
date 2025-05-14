
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const StudentCourses = () => {
  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6">My Courses</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Enrolled Courses</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Your enrolled courses will appear here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentCourses;
