
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AttendanceStatus } from '@/lib/types';
import { transformSessionUpdate } from './session-transformers';

interface UpdateSessionStatusProps {
  sessionId: string;
  status: AttendanceStatus;
  notes?: string;
}

const updateSessionStatus = async ({ sessionId, status, notes }: UpdateSessionStatusProps) => {
  // Create the update payload
  const updates = transformSessionUpdate({
    status,
    notes
  });

  // Update the session
  const { error } = await supabase
    .from('sessions')
    .update(updates)
    .eq('id', sessionId);

  if (error) {
    console.error('Error updating session status:', error);
    throw error;
  }

  return { sessionId, status };
};

export default function useUpdateSessionStatus(queryKeysToInvalidate: string[] = []) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSessionStatus,
    onSuccess: () => {
      // Invalidate relevant queries to refresh the data
      queryKeysToInvalidate.forEach(key => {
        queryClient.invalidateQueries({ queryKey: [key] });
      });
    }
  });
}
