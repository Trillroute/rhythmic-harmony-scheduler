
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TeacherMaterials = () => {
  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6">Course Materials</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Teaching Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Access your teaching materials and resources here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherMaterials;
