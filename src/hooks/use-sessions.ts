
import { useQueryClient } from "@tanstack/react-query";
import { useCreateSessions } from "./sessions/use-create-sessions";
import { useFetchSessions } from "./sessions/use-fetch-sessions";
import { useUpdateSession } from "./sessions/use-update-session";
import { FilterOptions } from "@/lib/types";
import { SessionsProps } from "./sessions/types";

// Main hook that composes all session functionality
export const useSessions = (props: FilterOptions = {}) => {
  const queryClient = useQueryClient();
  const queryKey = ["sessions", props];
  
  // Map FilterOptions to SessionsProps
  const sessionProps: SessionsProps = {
    teacherId: props.teacherId,
    studentId: props.studentId,
    fromDate: props.startDate ? new Date(props.startDate) : undefined,
    toDate: props.endDate ? new Date(props.endDate) : undefined,
    status: props.status ? Array.isArray(props.status) ? props.status : [props.status] : undefined
  };
  
  // Use the separated hooks with mapped props
  const { 
    sessions,
    loading: isLoading, 
    error,
    refreshSessions
  } = useFetchSessions(sessionProps);
  
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
