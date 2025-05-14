
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AttendanceStatus } from '@/lib/types';

interface UpdateSessionStatusParams {
  sessionId: string;
  status: AttendanceStatus;
}

export const useUpdateSessionStatus = (queryKeysToInvalidate: string[] = []) => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async ({ sessionId, status }: UpdateSessionStatusParams) => {
      if (!sessionId) throw new Error('Session ID is required');
      
      // Convert AttendanceStatus to string for database compatibility
      const statusString = status.toString();
      
      const { error } = await supabase
        .from('sessions')
        .update({ status: statusString })
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
