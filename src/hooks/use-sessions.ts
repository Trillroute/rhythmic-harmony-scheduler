
import { useQueryClient } from "@tanstack/react-query";
import { useCreateSessions } from "./sessions/use-create-sessions";
import { useFetchSessions } from "./sessions/use-fetch-sessions";
import { useUpdateSession } from "./sessions/use-update-session";
import { useRescheduleSession } from "./sessions/use-reschedule-session";
import { FilterOptions } from "@/lib/types";
import { SessionsProps } from "./sessions/types";

// Convert FilterOptions to SessionsProps
const mapFilterToProps = (filter: FilterOptions): SessionsProps => {
  const props: SessionsProps = {};
  
  if (filter.teacherId) props.teacherId = filter.teacherId;
  if (filter.studentId) props.studentId = filter.studentId;
  if (filter.startDate) props.fromDate = new Date(filter.startDate);
  if (filter.endDate) props.toDate = new Date(filter.endDate);
  if (filter.status) {
    // Handle both single status and array of status
    if (Array.isArray(filter.status)) {
      props.status = filter.status;
    } else {
      props.status = [filter.status];
    }
  }
  
  return props;
};

// Main hook that composes all session functionality
export const useSessions = (filters: FilterOptions = {}) => {
  const queryClient = useQueryClient();
  const queryKey = ["sessions", filters];
  
  // Convert FilterOptions to SessionsProps
  const props = mapFilterToProps(filters);
  
  // Use the separated hooks
  const fetchSessionsQuery = useFetchSessions(props);
  
  const updateSessionStatusMutation = useUpdateSession();
  const createBulkSessionsMutation = useCreateSessions(queryKey);
  const rescheduleSessionMutation = useRescheduleSession();
  
  // Return a unified API
  return {
    sessions: fetchSessionsQuery.data || [],
    isLoading: fetchSessionsQuery.isLoading,
    error: fetchSessionsQuery.error,
    refetchSessions: fetchSessionsQuery.refetch,
    updateSessionStatus: updateSessionStatusMutation.mutateAsync,
    createBulkSessions: createBulkSessionsMutation.mutateAsync,
    rescheduleSession: rescheduleSessionMutation.mutateAsync,
    isPendingCreate: createBulkSessionsMutation.isPending,
    isPendingUpdate: updateSessionStatusMutation.isPending,
    isPendingReschedule: rescheduleSessionMutation.isPending
  };
};
