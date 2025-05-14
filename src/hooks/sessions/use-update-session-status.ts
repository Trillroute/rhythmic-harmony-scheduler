
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AttendanceStatus, Session } from "@/lib/types";
import { toast } from "sonner";

interface UpdateStatusParams {
  sessionId: string;
  newStatus: AttendanceStatus;
  notes?: string;
}

export const useUpdateSessionStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sessionId, newStatus, notes }: UpdateStatusParams) => {
      // Update the session status
      const { data, error } = await supabase
        .from("sessions")
        .update({ status: String(newStatus), notes: notes })
        .eq("id", sessionId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Log the attendance event
      const { error: attendanceError } = await supabase
        .from("attendance_events")
        .insert({
          session_id: sessionId,
          status: String(newStatus),
          marked_by_user_id: (await supabase.auth.getUser()).data.user?.id,
          notes: notes || `Status updated to ${newStatus}`,
        });

      if (attendanceError) {
        console.error("Error recording attendance event:", attendanceError);
      }

      return data as Session;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["student-sessions"] });
      
      const statusMessage = {
        "Present": "Marked as present",
        "Absent": "Marked as absent",
        "Cancelled by Student": "Cancelled by student",
        "Cancelled by Teacher": "Cancelled by teacher",
        "Cancelled by School": "Cancelled by school",
        "Scheduled": "Rescheduled",
      }[variables.newStatus] || "Status updated";
      
      toast.success(`Session ${statusMessage}`);
    },
    onError: (error) => {
      console.error("Failed to update session status:", error);
      toast.error(`Failed to update session status: ${error instanceof Error ? error.message : "Unknown error"}`);
    },
  });
};
