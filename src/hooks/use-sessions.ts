
import { useQueryClient } from "@tanstack/react-query";
import { useCreateSessions } from "./sessions/use-create-sessions";
import { useFetchSessions } from "./sessions/use-fetch-sessions";
import { useUpdateSession } from "./sessions/use-update-session";
import { FilterOptions } from "@/lib/types";

// Main hook that composes all session functionality
export const useSessions = (props: FilterOptions = {}) => {
  const queryClient = useQueryClient();
  const queryKey = ["sessions", props];
  
  // Use the separated hooks
  const { 
    sessions,
    loading: isLoading, 
    error,
    refreshSessions
  } = useFetchSessions(props);
  
  const updateSessionStatusMutation = useUpdateSession();
  const createBulkSessionsMutation = useCreateSessions(queryKey);
  
  // Return a unified API
  return {
    sessions,
    isLoading,
    error,
    refetchSessions: refreshSessions,
    updateSessionStatus: updateSessionStatusMutation.mutateAsync,
    createBulkSessions: createBulkSessionsMutation.mutateAsync,
    isPendingCreate: createBulkSessionsMutation.isPending,
    isPendingUpdate: updateSessionStatusMutation.isPending
  };
};
