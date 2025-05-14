
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Session, AttendanceStatus, SubjectType, SessionType, LocationType } from "@/lib/types";
import { toast } from "sonner";

export const useCreateSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionData: Partial<Session>) => {
      // Insert the session with correct field mappings
      const { data: session, error: sessionError } = await supabase
        .from("sessions")
        .insert({
          pack_id: sessionData.packId,
          subject: sessionData.subject?.toString(),
          session_type: sessionData.sessionType?.toString(),
          location: sessionData.location?.toString(),
          date_time: sessionData.dateTime?.toString(),
          duration: sessionData.duration,
          notes: sessionData.notes,
          status: sessionData.status?.toString(),
          teacher_id: sessionData.teacherId,
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

// Add a new hook for creating multiple sessions
export const useCreateSessions = (queryKey: unknown[]) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionsData: Partial<Session>[]) => {
      // Process each session one by one
      const createdSessions = [];
      
      for (const sessionData of sessionsData) {
        // Insert the session with correct field mappings
        const { data: session, error: sessionError } = await supabase
          .from("sessions")
          .insert({
            pack_id: sessionData.packId,
            subject: sessionData.subject?.toString(),
            session_type: sessionData.sessionType?.toString(),
            location: sessionData.location?.toString(),
            date_time: sessionData.dateTime?.toString(),
            duration: sessionData.duration,
            notes: sessionData.notes,
            status: sessionData.status?.toString(),
            teacher_id: sessionData.teacherId,
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
        
        createdSessions.push(session);
      }

      return createdSessions;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Sessions created successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create sessions: ${error.message}`);
    },
  });
};
