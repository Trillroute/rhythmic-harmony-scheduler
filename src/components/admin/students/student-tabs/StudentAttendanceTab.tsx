
import React, { useState } from "react";
import { useSessionsByStudent } from "@/hooks/use-sessions-by-student"; 
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SessionStatusBadge } from "@/components/ui/session-status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangleIcon, CalendarIcon } from "lucide-react";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface StudentAttendanceTabProps {
  studentId: string;
}

export const StudentAttendanceTab: React.FC<StudentAttendanceTabProps> = ({ studentId }) => {
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  
  const { sessions, isLoading, error } = useSessionsByStudent(studentId, {
    startDate: dateRange.from,
    endDate: dateRange.to,
    status: statusFilter ? [statusFilter as any] : undefined,
  });

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (error) {
    return (
      <div className="p-6 rounded-lg bg-destructive/10 flex flex-col items-center justify-center">
        <AlertTriangleIcon className="h-10 w-10 text-destructive mb-4" />
        <h3 className="text-lg font-medium mb-2">Error Loading Attendance</h3>
        <p className="text-muted-foreground mb-4">
          {error instanceof Error ? error.message : "Failed to load attendance data"}
        </p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Attendance History
        </CardTitle>
        
        <div className="flex flex-col sm:flex-row gap-2 items-end sm:items-center w-full sm:w-auto">
          <DateRangePicker date={dateRange} setDate={setDateRange} />
          
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="Present">Present</SelectItem>
                <SelectItem value="Absent">Absent</SelectItem>
                <SelectItem value="Scheduled">Scheduled</SelectItem>
                <SelectItem value="Cancelled by Student">Cancelled by Student</SelectItem>
                <SelectItem value="Cancelled by Teacher">Cancelled by Teacher</SelectItem>
                <SelectItem value="Cancelled by School">Cancelled by School</SelectItem>
                <SelectItem value="No Show">No Show</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        {sessions.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Type</TableHead>
                  <TableHead className="hidden md:table-cell">Location</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell>
                      {format(new Date(session.dateTime), "MMM d, yyyy - h:mm a")}
                    </TableCell>
                    <TableCell>{session.subject}</TableCell>
                    <TableCell>{session.teacherName || "Unknown"}</TableCell>
                    <TableCell>
                      <SessionStatusBadge status={session.status} />
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{session.sessionType}</TableCell>
                    <TableCell className="hidden md:table-cell">{session.location}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="h-32 flex flex-col items-center justify-center">
            <p className="text-muted-foreground">No attendance records found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
