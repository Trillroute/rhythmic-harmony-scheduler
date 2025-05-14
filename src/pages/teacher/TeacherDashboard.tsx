
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, UsersIcon, ClipboardCheckIcon, BookOpenIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

const TeacherDashboard = () => {
  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6">Teacher Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link to="/teacher/scheduler">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Session Scheduler
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Schedule new lessons and manage your calendar
              </p>
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/teacher/attendance">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardCheckIcon className="h-5 w-5" />
                Attendance Tracker
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Mark attendance and manage session records
              </p>
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/teacher/students">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UsersIcon className="h-5 w-5" />
                My Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View and manage your assigned students
              </p>
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/teacher/materials">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpenIcon className="h-5 w-5" />
                Course Materials
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Access and manage teaching resources
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default TeacherDashboard;
