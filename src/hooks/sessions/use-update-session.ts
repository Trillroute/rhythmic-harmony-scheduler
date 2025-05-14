
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@/lib/types";
import { toast } from "sonner";

export const useUpdateSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...sessionData }: Partial<Session> & { id: string }) => {
      // Transform the data for database format
      const dataToUpdate: any = {};
      
      if (sessionData.teacherId) dataToUpdate.teacher_id = sessionData.teacherId;
      if (sessionData.packId) dataToUpdate.pack_id = sessionData.packId;
      if (sessionData.subject) dataToUpdate.subject = sessionData.subject.toString();
      if (sessionData.sessionType) dataToUpdate.session_type = sessionData.sessionType.toString();
      if (sessionData.location) dataToUpdate.location = sessionData.location.toString();
      if (sessionData.dateTime) dataToUpdate.date_time = sessionData.dateTime.toString();
      if (sessionData.duration) dataToUpdate.duration = sessionData.duration;
      if (sessionData.notes !== undefined) dataToUpdate.notes = sessionData.notes;
      if (sessionData.status) dataToUpdate.status = sessionData.status.toString();
      if (sessionData.rescheduleCount !== undefined) dataToUpdate.reschedule_count = sessionData.rescheduleCount;
      
      const { data, error } = await supabase
        .from("sessions")
        .update(dataToUpdate)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      toast.success("Session updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update session: ${error.message}`);
    },
  });
};
