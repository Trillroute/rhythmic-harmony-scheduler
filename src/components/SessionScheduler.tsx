
import React, { useEffect, useState } from "react";
import { SessionForm } from "./session-scheduler/SessionForm";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useToast } from "@/hooks/use-toast";
import { useSessions } from "@/hooks/use-sessions";
import { useTeachers } from "@/hooks/use-teachers";
import { useStudents } from "@/hooks/use-students";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

interface SessionSchedulerProps {
  onSuccess?: (data: any) => void;
}

const SessionScheduler: React.FC<SessionSchedulerProps> = ({ onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { sessions } = useSessions();
  const { teachers, isLoading: teachersLoading } = useTeachers();
  const { students, isLoading: studentsLoading } = useStudents();

  const handleSuccess = (data: any) => {
    toast({
      title: "Success",
      description: "Session scheduled successfully"
    });
    if (onSuccess) {
      onSuccess(data);
    }
  };

  if (teachersLoading || studentsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Schedule New Session</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <span>Loading data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!teachers || teachers.length === 0) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          No teachers available. Please add teachers before scheduling sessions.
        </AlertDescription>
      </Alert>
    );
  }

  if (!students || students.length === 0) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          No students available. Please add students before scheduling sessions.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Schedule New Session</CardTitle>
      </CardHeader>
      <CardContent>
        <SessionForm onSuccess={handleSuccess} />
      </CardContent>
    </Card>
  );
};

export default SessionScheduler;
