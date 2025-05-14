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
import { useUpdateSessionStatus } from '@/hooks/sessions/use-update-session-status';
import { SessionWithStudents } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const AttendanceTracker = () => {
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: new Date(new Date().setDate(new Date().getDate() - 7)),
    to: new Date()
  });
  
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  
  const { sessions, loading, error, refreshSessions } = useFetchSessions({
    fromDate: dateRange.from,
    toDate: dateRange.to,
    status: statusFilter ? [statusFilter] : undefined
  });
  
  const { updateSessionStatus, isPending } = useUpdateSessionStatus(['sessions']);
  
  const handleMarkAttendance = async (session: SessionWithStudents, status: string) => {
    try {
      await updateSessionStatus({
        sessionId: session.id,
        status: status
      });
      
      toast({
        title: "Attendance updated",
        description: `Session marked as ${status}`,
      });
      
      refreshSessions();
    } catch (err) {
      toast({
        title: "Failed to update attendance",
        description: err instanceof Error ? err.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };
  
  if (error) {
    return (
      <div className="p-6 rounded-md bg-destructive/10">
        <h2 className="text-lg font-semibold mb-2">Error</h2>
        <p>{error instanceof Error ? error.message : "An error occurred while loading data"}</p>
      </div>
    );
  }
  
  return (
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
              value={dateRange}
              onChange={setDateRange}
            />
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All statuses</SelectItem>
                <SelectItem value="Scheduled">Scheduled</SelectItem>
                <SelectItem value="Present">Present</SelectItem>
                <SelectItem value="Absent">Absent</SelectItem>
                <SelectItem value="Cancelled by Student">Cancelled by Student</SelectItem>
                <SelectItem value="Cancelled by Teacher">Cancelled by Teacher</SelectItem>
                <SelectItem value="No Show">No Show</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <LoaderIcon className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : sessions && sessions.length > 0 ? (
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
                            {session.studentIds.map((_, index) => (
                              <div key={index} className="text-sm">
                                {session.studentNames && session.studentNames[index] ? 
                                  session.studentNames[index] : 
                                  `Student ${index + 1}`}
                              </div>
                            ))}
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
                              disabled={isPending}
                            >
                              <CheckIcon className="h-4 w-4 mr-1" />
                              Present
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMarkAttendance(session, 'Absent')}
                              disabled={isPending}
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
