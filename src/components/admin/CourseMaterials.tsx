
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const CourseMaterials: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Course Materials</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Manage Course Materials</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Course materials management interface will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseMaterials;
