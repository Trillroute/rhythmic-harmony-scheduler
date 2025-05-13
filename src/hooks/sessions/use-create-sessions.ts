
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Session, AttendanceStatus, SubjectType, SessionType, LocationType } from "@/lib/types";
import { toast } from "sonner";

export const useCreateSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionData: Partial<Session>) => {
      // Insert the session
      const { data: session, error: sessionError } = await supabase
        .from("sessions")
        .insert({
          teacher_id: sessionData.teacherId,
          pack_id: sessionData.packId,
          subject: sessionData.subject?.toString(),
          session_type: sessionData.sessionType?.toString(),
          location: sessionData.location?.toString(),
          date_time: sessionData.dateTime?.toString(),
          duration: sessionData.duration,
          notes: sessionData.notes,
          status: sessionData.status?.toString(),
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Add students to the session
      if (sessionData.studentIds && sessionData.studentIds.length > 0) {
        const studentsToAdd = sessionData.studentIds.map((studentId) => ({
          session_id: session.id,
          student_id: studentId,
        }));

        const { error: studentError } = await supabase
          .from("session_students")
          .insert(studentsToAdd);

        if (studentError) throw studentError;
      }

      return session;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      toast.success("Session created successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create session: ${error.message}`);
    },
  });
};
