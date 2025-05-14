
import React from "react";
import { useSessionsByStudent } from "@/hooks/use-sessions-by-student";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { format } from "date-fns";
import { SessionStatusBadge } from "@/components/ui/session-status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AttendanceStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, ClockIcon, MapPinIcon } from "lucide-react";

interface StudentAttendanceTabProps {
  studentId: string;
}

export function StudentAttendanceTab({ studentId }: StudentAttendanceTabProps) {
  const { 
    sessions, 
    isLoading, 
    error 
  } = useSessionsByStudent(studentId);

  // Helper function to format session duration
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 
      ? `${hours} hr ${remainingMinutes} min` 
      : `${hours} hr`;
  };

  // Calculate attendance statistics
  const calculateStats = () => {
    if (!sessions || sessions.data?.length === 0) {
      return {
        total: 0,
        present: 0,
        absent: 0,
        cancelled: 0,
        presentPercentage: 0
      };
    }

    const sessionsData = sessions.data || [];
    
    const total = sessionsData.length;
    const present = sessionsData.filter(s => s.status === 'Present').length;
    const absent = sessionsData.filter(s => s.status === 'Absent').length;
    const cancelled = sessionsData.filter(s => 
      s.status === 'Cancelled by Student' || 
      s.status === 'Cancelled by Teacher' || 
      s.status === 'Cancelled by School'
    ).length;
    
    const presentPercentage = total > 0 
      ? Math.round((present / (total - cancelled)) * 100) 
      : 0;

    return { total, present, absent, cancelled, presentPercentage };
  };

  const stats = calculateStats();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Present</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.present}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Absent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{stats.absent}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.presentPercentage}%</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendance History</CardTitle>
          <CardDescription>
            Complete session attendance history for this student
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-32 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-destructive">
              Error loading attendance data
            </div>
          ) : !sessions || !sessions.data || sessions.data.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No attendance records found for this student
            </div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Session Type</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Location</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.data.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                          {session.date_time ? format(new Date(session.date_time), "MMM d, yyyy p") : "N/A"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{session.subject}</Badge>
                      </TableCell>
                      <TableCell>{session.session_type}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <ClockIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                          {formatDuration(session.duration)}
                        </div>
                      </TableCell>
                      <TableCell>{session.teacherName || "Unknown"}</TableCell>
                      <TableCell>
                        <SessionStatusBadge status={session.status as AttendanceStatus} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <MapPinIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                          {session.location}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
