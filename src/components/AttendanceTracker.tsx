
import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useSessions } from "@/hooks/use-sessions";
import { AttendanceStatus } from "@/lib/types";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, Pencil, User, Users } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button";

interface AttendanceTrackerProps {
  teacherId?: string;
}

const AttendanceTracker: React.FC<AttendanceTrackerProps> = ({ teacherId }) => {
  const [selectedSession, setSelectedSession] = useState<any | null>(null);
  const {
    sessions,
    isLoading,
    error,
    refetchSessions,
    updateSessionStatus
  } = useSessions({ teacherId });
  
  useEffect(() => {
    refetchSessions();
  }, [teacherId, refetchSessions]);
  
  if (isLoading) {
    return <Alert><AlertTitle>Loading sessions...</AlertTitle><AlertDescription>Fetching the latest session data for attendance tracking.</AlertDescription></Alert>;
  }
  
  // Fixed error handling to properly handle null error
  if (error) {
    const errorMessage = error ? (typeof error === 'object' && 'message' in error ? String(error.message) : 'Unknown error') : 'Unknown error';
    return <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>Could not load sessions: {errorMessage}</AlertDescription></Alert>;
  }
  
  if (!sessions || sessions.length === 0) {
    return <Alert><AlertTitle>No Sessions</AlertTitle><AlertDescription>No sessions found for the selected criteria.</AlertDescription></Alert>;
  }
  
  const handleMarkAttendance = async (session: any, status: AttendanceStatus) => {
    try {
      await updateSessionStatus({
        id: session.id,
        status
      });
      
      toast.success(`Session marked as ${status}`);
      
      // Refresh data
      refetchSessions();
    } catch (error) {
      console.error("Error marking attendance:", error);
      toast.error("Failed to update attendance status");
    }
  };

  return (
    <div className="container py-4">
      <h1 className="text-2xl font-bold mb-4">Attendance Tracker</h1>
      <Table>
        <TableCaption>A list of your recent sessions.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Date</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Students</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.map((session) => (
            <TableRow key={session.id}>
              <TableCell className="font-medium">{new Date(session.dateTime).toLocaleDateString()}</TableCell>
              <TableCell>{session.subject}</TableCell>
              <TableCell>{session.sessionType}</TableCell>
              <TableCell>{session.location}</TableCell>
              <TableCell>
                {session.studentIds && session.studentIds.length > 0 ? (
                  <Badge variant="secondary">{session.studentIds.length} <Users className="h-4 w-4 ml-1 inline-block" /></Badge>
                ) : (
                  <Badge variant="outline">Solo <User className="h-4 w-4 ml-1 inline-block" /></Badge>
                )}
              </TableCell>
              <TableCell>
                <Badge>{session.status}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => handleMarkAttendance(session, 'Present')}>
                      Mark Present
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleMarkAttendance(session, 'Absent')}>
                      Mark Absent
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      Edit <Pencil className="h-4 w-4 ml-2" />
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AttendanceTracker;
