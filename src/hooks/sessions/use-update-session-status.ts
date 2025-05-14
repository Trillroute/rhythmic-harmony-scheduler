
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { AttendanceStatus } from '@/lib/types';

interface UpdateSessionStatusParams {
  sessionId: string;
  status: string;
}

export const useUpdateSessionStatus = (queryKeysToInvalidate: string[] = []) => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async ({ sessionId, status }: UpdateSessionStatusParams) => {
      if (!sessionId) throw new Error('Session ID is required');
      
      // Update the session status
      const { error } = await supabase
        .from('sessions')
        .update({ status })
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
      toast({
        title: 'Failed to update status',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive'
      });
    },
  });

  return {
    updateSessionStatus: mutateAsync,
    isPending
  };
};
