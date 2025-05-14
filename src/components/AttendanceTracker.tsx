
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  CalendarIcon, 
  CheckIcon, 
  XIcon, 
  AlertTriangleIcon,
  LoaderIcon
} from 'lucide-react';
import { format } from 'date-fns';
import { useFetchSessions } from '@/hooks/sessions/use-fetch-sessions';
import { useUpdateSessionStatus } from '@/hooks/use-update-session-status';
import { AttendanceStatus, Session } from '@/lib/types';
import { toast } from 'sonner';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { DateRange } from 'react-day-picker';

const AttendanceTracker = () => {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().setDate(new Date().getDate() - 7)),
    to: new Date()
  });
  
  const [statusFilter, setStatusFilter] = useState<AttendanceStatus | undefined>();
  
  const { data: sessionsData, isLoading, error, refetch } = useFetchSessions({
    startDate: dateRange.from,
    endDate: dateRange.to,
    status: statusFilter ? [statusFilter] : undefined
  });
  
  const updateSessionStatusMutation = useUpdateSessionStatus(["sessions", "student-sessions"]);
  
  const handleMarkAttendance = async (session: any, status: AttendanceStatus) => {
    try {
      await updateSessionStatusMutation.updateSessionStatus({
        sessionId: session.id,
        status: status
      });
      
      toast.success(`Session marked as ${status}`);
      refetch();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      toast.error(`Failed to update attendance: ${errorMessage}`);
    }
  };
  
  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (range?.from) {
      // Ensure that we always have a to date (use from date if to is not provided)
      setDateRange({
        from: range.from,
        to: range.to || range.from
      });
    }
  };

  if (error) {
    return (
      <div className="p-6 rounded-md bg-destructive/10">
        <h2 className="text-lg font-semibold mb-2">Error</h2>
        <p>{typeof error === 'string' ? error : (error instanceof Error ? error.message : "An error occurred while loading data")}</p>
      </div>
    );
  }
  
  // Extract sessions from the result properly
  const sessions = sessionsData ? (Array.isArray(sessionsData) ? sessionsData : []) : [];

  return (
    <ErrorBoundary>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Attendance Tracker</h1>
        </div>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Session Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <DateRangePicker
                dateRange={dateRange}
                onChange={handleDateRangeChange}
              />
              
              <Select 
                value={statusFilter} 
                onValueChange={(value: any) => setStatusFilter(value as AttendanceStatus || undefined)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                  <SelectItem value="Present">Present</SelectItem>
                  <SelectItem value="Absent">Absent</SelectItem>
                  <SelectItem value="Cancelled by Student">Cancelled by Student</SelectItem>
                  <SelectItem value="Cancelled by Teacher">Cancelled by Teacher</SelectItem>
                  <SelectItem value="No Show">No Show</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <LoaderIcon className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : sessions.length > 0 ? (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Students</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell>
                          <div className="font-medium">
                            {format(new Date(session.dateTime), 'MMM dd, yyyy')}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(session.dateTime), 'h:mm a')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{session.subject}</div>
                          <div className="text-sm text-muted-foreground">{session.sessionType}</div>
                        </TableCell>
                        <TableCell>
                          {session.studentIds && session.studentIds.length > 0 ? (
                            <div className="space-y-1">
                              {session.studentIds.map((studentId: string, index: number) => {
                                // Safely display student names if available
                                const studentName = session.studentNames && 
                                                   Array.isArray(session.studentNames) && 
                                                   session.studentNames[index] 
                                                   ? session.studentNames[index] 
                                                   : `Student ${index + 1}`;
                                return (
                                  <div key={studentId} className="text-sm">
                                    {studentName}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">No students</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <AttendanceStatusBadge status={session.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          {session.status === 'Scheduled' && (
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleMarkAttendance(session, 'Present')}
                                disabled={updateSessionStatusMutation.isPending}
                              >
                                <CheckIcon className="h-4 w-4 mr-1" />
                                Present
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleMarkAttendance(session, 'Absent')}
                                disabled={updateSessionStatusMutation.isPending}
                              >
                                <XIcon className="h-4 w-4 mr-1" />
                                Absent
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CalendarIcon className="h-12 w-12 text-muted-foreground mb-3" />
                <h3 className="text-lg font-medium">No sessions found</h3>
                <p className="text-muted-foreground mt-1">
                  Try adjusting your filters or date range to see more sessions.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ErrorBoundary>
  );
};

const AttendanceStatusBadge = ({ status }: { status: string }) => {
  let variant: "default" | "outline" | "secondary" | "destructive" = "default";
  
  switch (status) {
    case 'Present':
      variant = "default";
      break;
    case 'Scheduled':
      variant = "outline";
      break;
    case 'Absent':
    case 'No Show':
      variant = "destructive";
      break;
    default:
      variant = "secondary";
  }
  
  return <Badge variant={variant}>{status}</Badge>;
};

export default AttendanceTracker;
