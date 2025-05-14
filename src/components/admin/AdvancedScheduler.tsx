
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SessionScheduler from '@/components/SessionScheduler';

const AdvancedScheduler: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Advanced Scheduler</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Schedule Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <SessionScheduler />
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedScheduler;
