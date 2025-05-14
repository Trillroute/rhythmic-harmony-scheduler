
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SubjectType, SessionType, LocationType, AttendanceStatus } from "@/lib/types";

interface SessionCreateProps {
  teacherId: string;
  packId: string;
  subject: SubjectType;
  sessionType: SessionType;
  location: LocationType;
  dateTime: Date;
  duration: number;
  notes?: string;
  studentIds?: string[];
}

export function useCreateSessions(queryKey: any[]) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionDataArray: SessionCreateProps[]) => {
      try {
        // Create array of session objects with proper snake_case for database
        const sessionObjects = sessionDataArray.map(session => ({
          teacher_id: session.teacherId,
          pack_id: session.packId,
          subject: session.subject,
          session_type: session.sessionType,
          location: session.location,
          date_time: session.dateTime.toISOString(),
          duration: session.duration,
          notes: session.notes || null,
          status: 'Scheduled' as AttendanceStatus, // Use type assertion
          reschedule_count: 0
        }));

        // Insert all sessions
        const { data: createdSessions, error: sessionsError } = await supabase
          .from("sessions")
          .insert(sessionObjects)
          .select();

        if (sessionsError) {
          throw new Error(sessionsError.message);
        }

        // For each session, link the student(s)
        for (let i = 0; i < createdSessions.length; i++) {
          const session = createdSessions[i];
          const studentIds = sessionDataArray[i].studentIds || [];

          if (studentIds.length > 0) {
            const studentSessionLinks = studentIds.map(studentId => ({
              session_id: session.id,
              student_id: studentId
            }));

            const { error: linkError } = await supabase
              .from("session_students")
              .insert(studentSessionLinks);

            if (linkError) {
              console.error(`Error linking students for session ${i}:`, linkError);
              // Continue with next session
            }
          }

          // Update session pack to decrement remaining_sessions
          const { data: packData, error: packFetchError } = await supabase
            .from("session_packs")
            .select("remaining_sessions")
            .eq('id', session.pack_id)
            .single();
            
          if (packFetchError) {
            console.warn(`Warning: Could not fetch pack for session ${i}:`, packFetchError);
            continue;
          }
            
          const { error: packUpdateError } = await supabase
            .from("session_packs")
            .update({ remaining_sessions: packData.remaining_sessions - 1 })
            .eq('id', session.pack_id);

          if (packUpdateError) {
            console.warn(`Warning: Could not update pack for session ${i}:`, packUpdateError);
            // Continue with next session
          }
        }

        return createdSessions;
      } catch (err: any) {
        console.error("Error creating bulk sessions:", err);
        throw new Error(err.message || "An error occurred while creating sessions");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Sessions created successfully");
    },
    onError: (error) => {
      toast.error(`Session creation failed: ${error.message}`);
    }
  });
}
