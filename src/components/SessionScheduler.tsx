
import React, { useEffect, useState } from "react";
import { SessionForm } from "./session-scheduler/SessionForm";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { toast } from "sonner";

interface SessionSchedulerProps {
  onSuccess?: (data: any) => void;
}

const SessionScheduler: React.FC<SessionSchedulerProps> = ({ onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSuccess = (data: any) => {
    toast.success("Session scheduled successfully");
    if (onSuccess) {
      onSuccess(data);
    }
  };
  
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
