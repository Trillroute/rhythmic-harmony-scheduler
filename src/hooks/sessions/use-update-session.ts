
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Session } from "@/lib/types";

interface UpdateSessionParams {
  sessionId: string;
  updates: Partial<Session>;
}

export const useUpdateSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sessionId, updates }: UpdateSessionParams) => {
      // Convert Session object properties to database column format
      const dbUpdates: Record<string, any> = {};
      
      if (updates.teacherId) dbUpdates.teacher_id = updates.teacherId;
      if (updates.packId) dbUpdates.pack_id = updates.packId;
      if (updates.subject) dbUpdates.subject = updates.subject;
      if (updates.sessionType) dbUpdates.session_type = updates.sessionType;
      if (updates.location) dbUpdates.location = updates.location;
      if (updates.dateTime) dbUpdates.date_time = updates.dateTime;
      if (updates.duration !== undefined) dbUpdates.duration = updates.duration;
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
      if (updates.rescheduleCount !== undefined) dbUpdates.reschedule_count = updates.rescheduleCount;
      if (updates.recurrenceRule !== undefined) dbUpdates.recurrence_rule = updates.recurrenceRule;
      if (updates.originalSessionId) dbUpdates.original_session_id = updates.originalSessionId;
      if (updates.rescheduledFrom) dbUpdates.rescheduled_from = updates.rescheduledFrom;

      const { data, error } = await supabase
        .from("sessions")
        .update(dbUpdates)
        .eq("id", sessionId)
        .select();

      if (error) {
        throw error;
      }

      // Convert the database response back to our Session type
      const session = data?.[0];
      if (!session) throw new Error('No session data returned');
      
      return session;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      toast.success("Session updated successfully");
    },
    onError: (error) => {
      console.error("Failed to update session:", error);
      toast.error(`Failed to update session: ${error instanceof Error ? error.message : "Unknown error"}`);
    },
  });
};
