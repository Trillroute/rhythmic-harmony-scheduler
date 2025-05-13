
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, Clock, User } from 'lucide-react';
import { teachers, students, sessions } from '@/lib/data';
import { AttendanceStatus, UserRole } from '@/lib/types';

interface DashboardProps {
  userRole: UserRole;
}

const Dashboard = ({ userRole }: DashboardProps) => {
  // Count statistics
  const totalTeachers = teachers.length;
  const totalStudents = students.length;
  const upcomingSessions = sessions.filter(s => s.status === 'Scheduled').length;
  const completedSessions = sessions.filter(s => s.status === 'Present').length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground mt-2">
          {userRole === 'admin' && 'Manage your music school schedule and attendance.'}
          {userRole === 'teacher' && 'View your upcoming sessions and update attendance.'}
          {userRole === 'student' && 'View your upcoming sessions and session packs.'}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {userRole === 'admin' && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
                <User className="h-4 w-4 text-music-purple" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalTeachers}</div>
                <p className="text-xs text-muted-foreground">Active teaching staff</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <Users className="h-4 w-4 text-music-blue" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalStudents}</div>
                <p className="text-xs text-muted-foreground">Enrolled students</p>
              </CardContent>
            </Card>
          </>
        )}
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-music-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingSessions}</div>
            <p className="text-xs text-muted-foreground">Scheduled sessions</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Completed Sessions</CardTitle>
            <Clock className="h-4 w-4 text-music-cyan" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedSessions}</div>
            <p className="text-xs text-muted-foreground">Successfully completed</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Sessions</CardTitle>
          </CardHeader>
          <CardContent className="px-2">
            <div className="space-y-2">
              {sessions.slice(0, 5).map(session => {
                const dateFormatted = new Date(session.dateTime).toLocaleDateString();
                const timeFormatted = new Date(session.dateTime).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                });
                
                return (
                  <div 
                    key={session.id} 
                    className="flex items-center justify-between p-2 border-b border-border last:border-0"
                  >
                    <div>
                      <div className="font-medium">{session.subject}</div>
                      <div className="text-sm text-muted-foreground">
                        {session.sessionType} - {dateFormatted} at {timeFormatted}
                      </div>
                    </div>
                    <div 
                      className={`px-2 py-1 text-xs rounded-full ${
                        session.status === 'Scheduled' ? 'bg-yellow-100 text-yellow-800' :
                        session.status === 'Present' ? 'bg-green-100 text-green-800' :
                        session.status === 'Cancelled by Student' ? 'bg-red-100 text-red-800' :
                        session.status === 'Cancelled by Teacher' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {session.status}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium">Sessions by Type</div>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <div className="flex flex-col p-3 bg-music-purple/10 rounded-lg">
                    <span className="text-lg font-bold">
                      {sessions.filter(s => s.sessionType === 'Solo').length}
                    </span>
                    <span className="text-xs text-muted-foreground">Solo</span>
                  </div>
                  <div className="flex flex-col p-3 bg-music-blue/10 rounded-lg">
                    <span className="text-lg font-bold">
                      {sessions.filter(s => s.sessionType === 'Duo').length}
                    </span>
                    <span className="text-xs text-muted-foreground">Duo</span>
                  </div>
                  <div className="flex flex-col p-3 bg-music-cyan/10 rounded-lg">
                    <span className="text-lg font-bold">
                      {sessions.filter(s => s.sessionType === 'Focus').length}
                    </span>
                    <span className="text-xs text-muted-foreground">Focus</span>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium">Sessions by Location</div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="flex flex-col p-3 bg-music-green/10 rounded-lg">
                    <span className="text-lg font-bold">
                      {sessions.filter(s => s.location === 'Online').length}
                    </span>
                    <span className="text-xs text-muted-foreground">Online</span>
                  </div>
                  <div className="flex flex-col p-3 bg-music-orange/10 rounded-lg">
                    <span className="text-lg font-bold">
                      {sessions.filter(s => s.location === 'Offline').length}
                    </span>
                    <span className="text-xs text-muted-foreground">Offline</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
