
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AttendanceStatus } from '@/lib/types';
import { assertStringArray } from '@/lib/type-utils';

interface UpdateSessionStatusParams {
  sessionId: string;
  status: AttendanceStatus;
}

export const useUpdateSessionStatus = (queryKeysToInvalidate: string[] = []) => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async ({ sessionId, status }: UpdateSessionStatusParams) => {
      if (!sessionId) throw new Error('Session ID is required');
      
      // Ensure status is a valid attendance status
      const validStatuses: string[] = [
        'Present', 'Absent', 'Scheduled', 'Cancelled by Student', 
        'Cancelled by Teacher', 'Cancelled by School', 'No Show'
      ];
      
      if (!validStatuses.includes(status)) {
        throw new Error(`Invalid status: ${status}`);
      }
      
      // Update the session status
      const { error } = await supabase
        .from('sessions')
        .update({ status: status })
        .eq('id', sessionId);

      if (error) throw error;

      return { sessionId, status };
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryKeysToInvalidate.forEach(key => {
        queryClient.invalidateQueries({ queryKey: [key] });
      });
    },
    onError: (error) => {
      console.error('Failed to update session status:', error);
      toast.error(`Failed to update status: ${error instanceof Error ? error.message : 'An unknown error occurred'}`);
    },
  });

  return {
    updateSessionStatus: mutateAsync,
    isPending
  };
};
