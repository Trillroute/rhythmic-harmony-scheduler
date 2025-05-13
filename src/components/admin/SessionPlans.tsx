
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SessionPlans: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Session Plans</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Manage Session Plans</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Session planning interface will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SessionPlans;
