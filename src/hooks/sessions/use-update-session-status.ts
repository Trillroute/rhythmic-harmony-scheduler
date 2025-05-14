
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AttendanceStatus } from "@/lib/types";
import { toast } from "sonner";
import { assertAttendanceStatus } from "@/lib/type-utils";

interface UpdateStatusParams {
  sessionId: string;
  newStatus: AttendanceStatus;
  notes?: string;
}

export const useUpdateSessionStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sessionId, newStatus, notes }: UpdateStatusParams) => {
      if (!sessionId) throw new Error('Session ID is required');
      
      // Convert AttendanceStatus to string for database compatibility
      const statusString = String(newStatus);
      
      const { data, error } = await supabase
        .from("sessions")
        .update({ 
          status: statusString,
          notes: notes 
        })
        .eq("id", sessionId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Log the attendance event
      const user = await supabase.auth.getUser();
      const userId = user.data.user?.id;
        
      if (userId) {
        const { error: attendanceError } = await supabase
          .from("attendance_events")
          .insert({
            session_id: sessionId,
            status: statusString,
            marked_by_user_id: userId,
            notes: notes || `Status updated to ${newStatus}`
          });

        if (attendanceError) {
          console.error("Error recording attendance event:", attendanceError);
        }
      }

      return data;
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
        "No Show": "Marked as no show"
      }[variables.newStatus] || "Status updated";
      
      toast.success(`Session ${statusMessage}`);
    },
    onError: (error) => {
      console.error("Failed to update session status:", error);
      toast.error(`Failed to update session status: ${error instanceof Error ? error.message : "Unknown error"}`);
    },
  });
};
