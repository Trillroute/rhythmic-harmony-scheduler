
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useSessionsByStudent } from '@/hooks/use-sessions-by-student';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { LoaderIcon, CalendarIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';

interface StudentAttendanceTabProps {
  studentId: string;
}

export const StudentAttendanceTab: React.FC<StudentAttendanceTabProps> = ({ studentId }) => {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date()
  });
  
  const { data: sessions, isLoading, error } = useSessionsByStudent(studentId, {
    dateRange: dateRange ? {
      from: dateRange.from?.toISOString() || '',
      to: dateRange.to?.toISOString() || ''
    } : undefined
  });
  
  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (range?.from) {
      setDateRange({
        from: range.from,
        to: range.to || range.from
      });
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <CardTitle>Attendance History</CardTitle>
          <DateRangePicker
            dateRange={dateRange}
            onChange={handleDateRangeChange}
          />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <LoaderIcon className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="p-4 bg-destructive/10 rounded-md">
            <p>Error loading attendance data: {error instanceof Error ? error.message : 'Unknown error'}</p>
          </div>
        ) : sessions && sessions.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead>Status</TableHead>
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
                    <div>{session.subject}</div>
                    <div className="text-sm text-muted-foreground">{session.sessionType}</div>
                  </TableCell>
                  <TableCell>
                    <div>{session.teacherName}</div>
                  </TableCell>
                  <TableCell>
                    <AttendanceStatusBadge status={session.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CalendarIcon className="h-12 w-12 text-muted-foreground mb-3" />
            <h3 className="text-lg font-medium">No sessions found</h3>
            <p className="text-muted-foreground mt-1">
              Try adjusting your date range to see more sessions.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
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
