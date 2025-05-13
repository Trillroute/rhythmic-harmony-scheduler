
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, Clock, CalendarCheck } from 'lucide-react';
import { Session, AttendanceStatus, User } from '@/lib/types';
import { sessions, getUserById } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

interface AttendanceTrackerProps {
  teacherId: string;
}

const AttendanceTracker = ({ teacherId }: AttendanceTrackerProps) => {
  const { toast } = useToast();
  const [sessionList, setSessionList] = useState<Session[]>(() => {
    // Filter sessions for this teacher
    return sessions.filter(session => session.teacherId === teacherId);
  });
  
  const [filter, setFilter] = useState<'upcoming' | 'past' | 'all'>('upcoming');
  
  // Filter sessions based on current filter
  const filteredSessions = sessionList.filter(session => {
    const sessionDate = new Date(session.dateTime);
    const today = new Date();
    
    if (filter === 'upcoming') {
      return sessionDate >= today && session.status === 'Scheduled';
    } else if (filter === 'past') {
      return sessionDate < today || session.status !== 'Scheduled';
    } else {
      return true;
    }
  });
  
  // Sort sessions by date (newest first for past, oldest first for upcoming)
  const sortedSessions = [...filteredSessions].sort((a, b) => {
    if (filter === 'past') {
      return new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime();
    } else {
      return new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime();
    }
  });
  
  const updateAttendance = (sessionId: string, status: AttendanceStatus) => {
    // Update the session status
    setSessionList(prevSessions => 
      prevSessions.map(session => 
        session.id === sessionId ? { ...session, status } : session
      )
    );
    
    // Show toast message
    toast({
      title: "Attendance Updated",
      description: `Session marked as ${status}`,
    });
  };
  
  const getStudentNames = (studentIds: string[]): string => {
    return studentIds.map(id => {
      const student = getUserById(id);
      return student ? student.name : 'Unknown Student';
    }).join(', ');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Attendance Tracker</h2>
          <p className="text-muted-foreground">Mark attendance for your sessions</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant={filter === 'upcoming' ? 'default' : 'outline'} 
            onClick={() => setFilter('upcoming')}
            size="sm"
          >
            Upcoming
          </Button>
          <Button 
            variant={filter === 'past' ? 'default' : 'outline'} 
            onClick={() => setFilter('past')}
            size="sm"
          >
            Past
          </Button>
          <Button 
            variant={filter === 'all' ? 'default' : 'outline'} 
            onClick={() => setFilter('all')}
            size="sm"
          >
            All
          </Button>
        </div>
      </div>
      
      <div className="grid gap-4">
        {sortedSessions.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">
                No {filter} sessions found.
              </p>
            </CardContent>
          </Card>
        ) : (
          sortedSessions.map(session => {
            const sessionDate = new Date(session.dateTime);
            const isPastSession = sessionDate < new Date();
            
            return (
              <Card key={session.id} className="overflow-hidden">
                <CardHeader className="bg-muted/50">
                  <CardTitle className="text-lg flex justify-between items-center">
                    <div className="flex items-center">
                      <span>{session.subject} - {session.sessionType}</span>
                      <span className="ml-2 text-sm text-muted-foreground">
                        ({session.location})
                      </span>
                    </div>
                    {session.status !== 'Scheduled' && (
                      <div 
                        className={`px-2 py-1 text-xs rounded-full ${
                          session.status === 'Present' ? 'bg-green-100 text-green-800' :
                          session.status === 'Cancelled by Student' ? 'bg-red-100 text-red-800' :
                          session.status === 'Cancelled by Teacher' ? 'bg-orange-100 text-orange-800' :
                          session.status === 'Cancelled by School' ? 'bg-gray-100 text-gray-800' :
                          ''
                        }`}
                      >
                        {session.status}
                      </div>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div className="flex flex-wrap gap-x-6 gap-y-2">
                    <div>
                      <div className="text-sm text-muted-foreground">Date & Time</div>
                      <div className="font-medium">
                        {sessionDate.toLocaleDateString()} at {sessionDate.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Duration</div>
                      <div className="font-medium">{session.duration} minutes</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Students</div>
                      <div className="font-medium">{getStudentNames(session.studentIds)}</div>
                    </div>
                  </div>
                  
                  {session.status === 'Scheduled' && (
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-green-500 text-white hover:bg-green-600"
                        onClick={() => updateAttendance(session.id, 'Present')}
                        disabled={!isPastSession}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Present
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-red-500 text-white hover:bg-red-600"
                        onClick={() => updateAttendance(session.id, 'Cancelled by Student')}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Student Cancelled
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-orange-500 text-white hover:bg-orange-600"
                        onClick={() => updateAttendance(session.id, 'Cancelled by Teacher')}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Teacher Cancelled
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateAttendance(session.id, 'Cancelled by School')}
                      >
                        <X className="w-4 h-4 mr-1" />
                        School Cancelled
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AttendanceTracker;
