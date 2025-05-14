
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TeacherStudents = () => {
  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6">My Students</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Student List</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Your assigned students will appear here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherStudents;
