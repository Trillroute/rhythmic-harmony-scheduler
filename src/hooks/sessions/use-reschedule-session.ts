
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SessionRescheduleProps } from "@/lib/types";

export function useRescheduleSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rescheduleData: SessionRescheduleProps) => {
      try {
        // Use the database function to reschedule the session
        const { data: newSessionId, error } = await supabase.rpc(
          'reschedule_session',
          {
            session_id_param: rescheduleData.sessionId,
            new_date_time: rescheduleData.newDateTime.toISOString(),
            new_duration_param: rescheduleData.newDuration,
            new_teacher_id_param: rescheduleData.newTeacherId,
            new_notes_param: rescheduleData.newNotes
          }
        );
        
        if (error) {
          throw new Error(error.message);
        }
        
        return newSessionId;
      } catch (err: any) {
        console.error("Error rescheduling session:", err);
        throw new Error(err.message || "An error occurred while rescheduling the session");
      }
    },
    onSuccess: () => {
      toast.success("Session rescheduled successfully");
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
    onError: (error) => {
      toast.error(`Failed to reschedule session: ${error.message}`);
    }
  });
}
