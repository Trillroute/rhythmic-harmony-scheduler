
import { useQueryClient } from "@tanstack/react-query";
import { useCreateSessions } from "./sessions/use-create-sessions";
import { useFetchSessions } from "./sessions/use-fetch-sessions";
import { useUpdateSession } from "./sessions/use-update-session";
import { SessionsProps, SessionWithStudents } from "./sessions/types";

// Re-export types for backward compatibility
export { SessionWithStudents } from "./sessions/types";

// Main hook that composes all session functionality
export const useSessions = (props: SessionsProps = {}) => {
  const queryClient = useQueryClient();
  const queryKey = ["sessions", props];
  
  // Use the separated hooks
  const { 
    data, 
    isLoading, 
    error 
  } = useFetchSessions(props);
  
  const updateSessionStatusMutation = useUpdateSession(queryKey);
  const createBulkSessionsMutation = useCreateSessions(queryKey);
  
  // Return a unified API
  return {
    sessions: data,
    isLoading,
    error,
    refetchSessions: () => queryClient.invalidateQueries({ queryKey }),
    updateSessionStatus: updateSessionStatusMutation.mutateAsync,
    createBulkSessions: createBulkSessionsMutation.mutateAsync,
    isPendingCreate: createBulkSessionsMutation.isPending,
    isPendingUpdate: updateSessionStatusMutation.isPending
  };
};
