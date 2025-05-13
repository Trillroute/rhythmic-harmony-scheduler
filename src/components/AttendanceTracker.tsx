import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SessionStatusBadge } from '@/components/ui/session-status-badge';
import { useToast } from '@/hooks/use-toast';
import { format, addDays, subDays } from 'date-fns';
import { useSessions, useUpdateSessionStatus, useRescheduleSession } from '@/hooks/use-sessions';
import { Session, FilterOptions } from '@/lib/types';
import { CheckCircle, XCircle, AlertCircle, CalendarX, Clock } from 'lucide-react';

// If needed, define the props interface
interface AttendanceTrackerProps {
  // Add any props needed
}

const AttendanceTracker: React.FC<AttendanceTrackerProps> = () => {
  const { toast } = useToast();

  // State for date filtering
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 7));
  const [endDate, setEndDate] = useState<Date>(addDays(new Date(), 14));
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [rescheduleDate, setRescheduleDate] = useState<Date | undefined>(new Date());

  // Create filter options for sessions
  const filterOptions: FilterOptions = {
    startDate,
    endDate,
  };

  // Fetch sessions
  const { sessions, isLoading, error } = useSessions(filterOptions);
  const updateSessionStatus = useUpdateSessionStatus();
  const rescheduleSession = useRescheduleSession();

  const groupSessionsByDate = (sessions: Session[]) => {
    return sessions.reduce((acc: { [key: string]: Session[] }, session: Session) => {
      const date = format(new Date(session.dateTime), 'PPP');
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(session);
      return acc;
    }, {});
  };

  const groupedSessions = groupSessionsByDate(sessions || []);

  const handleAttendance = async (sessionId: string, status: string) => {
    try {
      await updateSessionStatus.mutateAsync({ id: sessionId, status: status });
      toast({
        title: "Attendance Updated",
        description: "Session attendance has been updated successfully.",
      });
      setSelectedSessionId(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to update attendance.",
        variant: "destructive",
      });
    }
  };

  const handleReschedule = async () => {
    if (!selectedSessionId || !rescheduleDate) return;
  
    try {
      await rescheduleSession.mutateAsync({ 
        id: selectedSessionId, 
        dateTime: rescheduleDate 
      });
      toast({
        title: "Session Rescheduled",
        description: "Session has been rescheduled successfully.",
      });
      setSelectedSessionId(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to reschedule session.",
        variant: "destructive",
      });
    }
  };

  const handleOpenDialog = (sessionId: string) => {
    setSelectedSessionId(sessionId);
  };

  const handleCloseDialog = () => {
    setSelectedSessionId(null);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Attendance Tracker</CardTitle>
          <CardDescription>Track session attendance and manage rescheduling.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Start Date</Label>
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={setStartDate}
            />
          </div>
          <div>
            <Label>End Date</Label>
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={setEndDate}
            />
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div>Loading sessions...</div>
      ) : error ? (
        <div>Error: {error.message}</div>
      ) : (
        Object.entries(groupedSessions).map(([date, sessions]) => (
          <Card key={date}>
            <CardHeader>
              <CardTitle>{date}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-none space-y-2">
                {sessions.map((session) => (
                  <li key={session.id} className="border rounded-md p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{session.subject} Session</h3>
                        <p className="text-sm text-gray-500">
                          {format(new Date(session.dateTime), 'h:mm a')} - Teacher: {session.teacherName}
                        </p>
                      </div>
                      <SessionStatusBadge status={session.status} />
                    </div>
                    <div className="mt-2 flex justify-end space-x-2">
                      {session.status === 'Scheduled' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAttendance(session.id, 'Present')}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Present
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAttendance(session.id, 'No Show')}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            No Show
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenDialog(session.id)}
                              >
                                <CalendarX className="mr-2 h-4 w-4" />
                                Reschedule
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                              <DialogHeader>
                                <DialogTitle>Reschedule Session</DialogTitle>
                                <DialogDescription>
                                  Select a new date and time to reschedule the session.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="date" className="text-right">
                                    New Date
                                  </Label>
                                  <Calendar
                                    mode="single"
                                    selected={rescheduleDate}
                                    onSelect={setRescheduleDate}
                                    className="col-span-3"
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button type="button" onClick={handleCloseDialog} variant="secondary">
                                  Cancel
                                </Button>
                                <Button type="submit" onClick={handleReschedule}>Save changes</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))
      )}

      <Dialog open={selectedSessionId !== null} onOpenChange={(open) => {
        if (!open) {
          handleCloseDialog();
        }
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Session Notes</DialogTitle>
            <DialogDescription>
              Add any relevant notes about the session.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notes
              </Label>
              <Textarea id="notes" className="col-span-3" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" onClick={handleCloseDialog} variant="secondary">
              Cancel
            </Button>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AttendanceTracker;
