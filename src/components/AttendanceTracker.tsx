// This component is read-only, so let's create a wrapper component that includes proper error handling
import React from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { toast } from '@/hooks/use-toast';
import { useSessions } from '@/hooks/use-sessions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, User, Users } from 'lucide-react';
import { AttendanceStatus, SessionWithStudents } from '@/lib/types';
import { format } from 'date-fns';

interface AttendanceTrackerProps {
  teacherId?: string;
}

const AttendanceTracker: React.FC<AttendanceTrackerProps> = ({ teacherId }) => {
  if (!teacherId) {
    return (
      <div className="p-6 bg-muted/20 rounded-lg border border-muted text-center">
        <p className="text-muted-foreground">No teacher ID provided. Cannot display attendance records.</p>
      </div>
    );
  }
  
  return (
    <ErrorBoundary fallback={
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-lg font-medium text-red-800 mb-2">Unable to load attendance data</h3>
        <p className="text-red-700">There was a problem loading the attendance tracker. Please try again later.</p>
        <button 
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          onClick={() => window.location.reload()}
        >
          Reload page
        </button>
      </div>
    }>
      <AttendanceTrackerContent teacherId={teacherId} />
    </ErrorBoundary>
  );
};

const AttendanceTrackerContent: React.FC<{ teacherId: string }> = ({ teacherId }) => {
  const { 
    sessions, 
    isLoading, 
    error, 
    updateSessionStatus 
  } = useSessions({ teacherId });

  const handleMarkAttendance = async (sessionId: string, status: AttendanceStatus) => {
    try {
      await updateSessionStatus({ id: sessionId, status });
      toast({
        title: "Attendance updated",
        description: `Session marked as ${status}`,
      });
    } catch (err) {
      console.error('Error updating attendance:', err);
      toast({
        title: "Update failed",
        description: "Could not update attendance status",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-lg font-medium text-red-800 mb-2">Error loading sessions</h3>
        <p className="text-red-700">{error}</p>
        <Button 
          variant="destructive" 
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    );
  }

  if (!sessions || sessions.length === 0) {
    return (
      <div className="p-6 bg-muted/20 rounded-lg border border-muted text-center">
        <p className="text-muted-foreground">No sessions found for this teacher.</p>
      </div>
    );
  }

  // Group sessions by date for better organization
  const sessionsByDate = sessions.reduce((acc, session) => {
    const date = format(new Date(session.dateTime), 'yyyy-MM-dd');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(session);
    return acc;
  }, {} as Record<string, SessionWithStudents[]>);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Attendance Tracker</h2>
      </div>

      {Object.entries(sessionsByDate).map(([date, dateSessions]) => (
        <div key={date} className="space-y-4">
          <h3 className="text-lg font-medium border-b pb-2">
            {format(new Date(date), 'EEEE, MMMM d, yyyy')}
          </h3>
          
          <div className="grid gap-4 md:grid-cols-2">
            {dateSessions.map(session => (
              <Card key={session.id} className="overflow-hidden">
                <CardHeader className="bg-muted/50 pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{session.subject}</CardTitle>
                    <AttendanceStatusBadge status={session.status} />
                  </div>
                </CardHeader>
                
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>
                        {format(new Date(session.dateTime), 'h:mm a')} - 
                        {format(new Date(new Date(session.dateTime).getTime() + session.duration * 60000), 'h:mm a')}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{session.location}</span>
                    </div>
                    
                    <div className="flex items-center text-sm">
                      <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{session.sessionType} Session</span>
                    </div>
                    
                    {session.studentNames && session.studentNames.length > 0 && (
                      <div className="flex items-start text-sm">
                        <User className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                        <div>
                          <span className="font-medium">Students: </span>
                          <span>{session.studentNames.join(', ')}</span>
                        </div>
                      </div>
                    )}
                    
                    {session.status === 'Scheduled' && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        <Button 
                          size="sm" 
                          variant="default"
                          onClick={() => handleMarkAttendance(session.id, 'Present')}
                        >
                          Mark Present
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleMarkAttendance(session.id, 'Absent')}
                        >
                          Mark Absent
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleMarkAttendance(session.id, 'No Show')}
                        >
                          No Show
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const AttendanceStatusBadge: React.FC<{ status: AttendanceStatus }> = ({ status }) => {
  let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
  
  switch (status) {
    case 'Present':
      variant = "default";
      break;
    case 'Absent':
    case 'No Show':
      variant = "destructive";
      break;
    case 'Scheduled':
      variant = "secondary";
      break;
    default:
      variant = "outline";
  }
  
  return <Badge variant={variant}>{status}</Badge>;
};

export default AttendanceTracker;
