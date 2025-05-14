
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const StudentResources = () => {
  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6">Learning Resources</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Course Materials</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Your learning resources will appear here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentResources;
