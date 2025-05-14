import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Fix the session status type issue by explicitly casting to string

const useUpdateSessionStatus = () => {
  const queryClient = useQueryClient();

// Fix the status type in the updateSession function
const updateSession = useMutation({
  mutationFn: async ({ sessionId, status }: { sessionId: string, status: string }) => {
    const { data, error } = await supabase
      .from('sessions')
      .update({ status: status as string })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },
  onSuccess: (data) => {
    queryClient.invalidateQueries({ queryKey: ['sessions'] });
    toast.success(`Session status updated to ${data.status}`);
  },
  onError: (error) => {
    toast.error(`Failed to update session status: ${error.message}`);
  },
});

  return { updateSession: updateSession.mutate, isPending: updateSession.isPending };
};

export default useUpdateSessionStatus;
