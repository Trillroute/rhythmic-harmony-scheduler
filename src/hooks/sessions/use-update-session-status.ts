
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AttendanceStatus } from "@/lib/types";

interface UpdateSessionStatusParams {
  sessionId: string;
  status: AttendanceStatus;
}

const updateSessionStatus = async ({ sessionId, status }: UpdateSessionStatusParams) => {
  // Validate the status value to ensure it matches Supabase expectations
  const validStatuses = [
    'Present', 'Absent', 'Scheduled', 
    'Cancelled by Student', 'Cancelled by Teacher', 
    'Cancelled by School', 'No Show'
  ];

  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid status: ${status}. Must be one of: ${validStatuses.join(', ')}`);
  }

  const { data, error } = await supabase
    .from('sessions')
    .update({ status }) // Use status directly, no need for casting
    .eq('id', sessionId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update session status: ${error.message}`);
  }

  return data;
};

export default function useUpdateSessionStatus(invalidateQueries: string[] = []) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSessionStatus,
    onSuccess: (data) => {
      // Invalidate queries that depend on this data
      invalidateQueries.forEach(queryKey => {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
      });
      toast.success(`Session status updated to ${data.status}`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });
}
