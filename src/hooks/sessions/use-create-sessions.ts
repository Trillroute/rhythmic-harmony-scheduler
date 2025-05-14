
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SubjectType, SessionType, LocationType, AttendanceStatus } from "@/lib/types";
import { SessionCreateProps } from "./types";

export function useCreateSessions(queryKey: any[]) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionDataArray: SessionCreateProps[]) => {
      try {
        let createdSessions: any[] = [];
        
        for (const sessionData of sessionDataArray) {
          // Check if this is a recurring session
          if (sessionData.recurrenceRule) {
            // Use the DB function to create recurring sessions
            const { data: recurringSessionIds, error: recurringError } = await supabase.rpc(
              'create_recurring_sessions',
              {
                teacher_id_param: sessionData.teacherId,
                pack_id_param: sessionData.packId,
                subject_param: sessionData.subject,
                session_type_param: sessionData.sessionType,
                location_param: sessionData.location,
                start_date_time: sessionData.dateTime.toISOString(),
                duration_param: sessionData.duration,
                notes_param: sessionData.notes || null,
                recurrence_rule_param: sessionData.recurrenceRule,
                student_ids_param: sessionData.studentIds || []
              }
            );
            
            if (recurringError) {
              throw new Error(recurringError.message);
            }
            
            // Add the recurring session IDs to our created sessions
            createdSessions = [...createdSessions, ...recurringSessionIds];
            
          } else {
            // Single session - create directly
            const sessionObject = {
              teacher_id: sessionData.teacherId,
              pack_id: sessionData.packId,
              subject: sessionData.subject,
              session_type: sessionData.sessionType,
              location: sessionData.location,
              date_time: sessionData.dateTime.toISOString(),
              duration: sessionData.duration,
              notes: sessionData.notes || null,
              status: "Scheduled" as AttendanceStatus,
              recurrence_rule: sessionData.recurrenceRule
            };
            
            const { data: createdSession, error: sessionError } = await supabase
              .from("sessions")
              .insert(sessionObject)
              .select();
              
            if (sessionError) {
              throw new Error(sessionError.message);
            }
            
            if (!createdSession || createdSession.length === 0) {
              throw new Error("Failed to create session");
            }
            
            // Link student(s) to the session if provided
            if (sessionData.studentIds && sessionData.studentIds.length > 0) {
              const studentSessionLinks = sessionData.studentIds.map(studentId => ({
                session_id: createdSession[0].id,
                student_id: studentId
              }));

              const { error: linkError } = await supabase
                .from("session_students")
                .insert(studentSessionLinks);

              if (linkError) {
                console.error(`Error linking students:`, linkError);
              }
            }

            // Update session pack to decrement remaining_sessions
            const { error: packUpdateError } = await supabase
              .from("session_packs")
              .update({ remaining_sessions: supabase.rpc('decrement', { x: 1 }) })
              .eq('id', sessionData.packId);

            if (packUpdateError) {
              console.warn(`Warning: Could not update pack:`, packUpdateError);
            }
            
            // Add the session to our created sessions array
            createdSessions.push(createdSession[0]);
          }
        }

        return createdSessions;
      } catch (err: any) {
        console.error("Error creating sessions:", err);
        throw new Error(err.message || "An error occurred while creating sessions");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error: Error) => {
      toast.error(`Session creation failed: ${error.message}`);
    }
  });
}
