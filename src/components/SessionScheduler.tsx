
import React from "react";
import { SessionForm } from "./session-scheduler/SessionForm";

interface SessionSchedulerProps {
  onSuccess?: (data: any) => void;
}

const SessionScheduler: React.FC<SessionSchedulerProps> = ({ onSuccess }) => {
  return <SessionForm onSuccess={onSuccess} />;
};

export default SessionScheduler;
