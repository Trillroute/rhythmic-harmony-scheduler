
import React, { useState } from "react";
import { useSessionsByStudent } from "@/hooks/use-sessions-by-student";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangleIcon, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { AttendanceStatus } from "@/lib/types";

interface StudentAttendanceTabProps {
  studentId: string;
}

export const StudentAttendanceTab: React.FC<StudentAttendanceTabProps> = ({ studentId }) => {
  const [statusFilter, setStatusFilter] = useState<AttendanceStatus | undefined>();
  
  const { data: sessions, isLoading, error } = useSessionsByStudent(studentId, {
    status: statusFilter
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
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Session Attendance
        </CardTitle>
        <Select value={statusFilter} onValueChange={(value: AttendanceStatus) => setStatusFilter(value || undefined)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All sessions</SelectItem>
            <SelectItem value="Present">Present</SelectItem>
            <SelectItem value="Absent">Absent</SelectItem>
            <SelectItem value="Scheduled">Scheduled</SelectItem>
            <SelectItem value="Cancelled by Student">Cancelled by Student</SelectItem>
            <SelectItem value="Cancelled by Teacher">Cancelled by Teacher</SelectItem>
            <SelectItem value="Cancelled by School">Cancelled by School</SelectItem>
            <SelectItem value="No Show">No Show</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {sessions && sessions.length > 0 ? (
          <div className="rounded-md border">
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
                      {session.dateTime ? format(new Date(session.dateTime), "PPp") : "Unknown"}
                    </TableCell>
                    <TableCell>{session.subject}</TableCell>
                    <TableCell>{session.teacherName || "Unknown"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          session.status === "Present"
                            ? "default"
                            : session.status === "Scheduled"
                            ? "outline"
                            : session.status === "Absent" || session.status === "No Show"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {session.status}
                      </Badge>
                    </TableCell>
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
