
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SessionScheduler from '@/components/SessionScheduler';
import { CalendarIcon, UsersIcon, ClockIcon } from 'lucide-react';

const AdvancedScheduler: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Advanced Scheduler</h1>
      </div>
      
      <Tabs defaultValue="schedule">
        <TabsList className="mb-4">
          <TabsTrigger value="schedule">
            <CalendarIcon className="mr-2 h-4 w-4" />
            Schedule Sessions
          </TabsTrigger>
          <TabsTrigger value="bulk">
            <UsersIcon className="mr-2 h-4 w-4" />
            Bulk Scheduling
          </TabsTrigger>
          <TabsTrigger value="templates">
            <ClockIcon className="mr-2 h-4 w-4" />
            Templates
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Schedule Sessions</CardTitle>
              <CardDescription>Create new sessions or edit existing ones</CardDescription>
            </CardHeader>
            <CardContent>
              <SessionScheduler />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="bulk">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Scheduling</CardTitle>
              <CardDescription>Schedule multiple sessions at once</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-10">
                <h3 className="text-lg font-medium">Bulk scheduling coming soon</h3>
                <p className="text-muted-foreground mt-2">This feature is currently under development.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Session Templates</CardTitle>
              <CardDescription>Create and manage session templates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-10">
                <h3 className="text-lg font-medium">Templates coming soon</h3>
                <p className="text-muted-foreground mt-2">This feature is currently under development.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedScheduler;
