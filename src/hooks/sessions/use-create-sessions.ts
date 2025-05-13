
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SessionCreateProps } from "./types";
import { toast } from "sonner";
import { AttendanceStatus } from "@/lib/types";

// Hook for creating new sessions in bulk
export const useCreateSessions = (queryKey: any[]) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (sessionsData: SessionCreateProps[]) => {
      // Create sessions one by one and handle student associations
      const results = [];
      
      for (const sessionData of sessionsData) {
        const { studentIds, ...sessionFields } = sessionData;
        
        // Convert date to ISO string
        const formattedData = {
          teacher_id: sessionFields.teacherId,
          pack_id: sessionFields.packId,
          subject: sessionFields.subject,
          session_type: sessionFields.sessionType,
          location: sessionFields.location,
          date_time: sessionFields.dateTime.toISOString(),
          duration: sessionFields.duration,
          notes: sessionFields.notes || '',
          status: 'Scheduled' as AttendanceStatus
        };
        
        // Create session
        const { data: newSession, error: sessionError } = await supabase
          .from("sessions")
          .insert(formattedData)
          .select();
          
        if (sessionError) {
          throw sessionError;
        }
        
        // If we have studentIds, create session_students records
        if (studentIds && studentIds.length > 0 && newSession && newSession[0]) {
          const sessionStudentsData = studentIds.map(studentId => ({
            session_id: newSession[0].id,
            student_id: studentId
          }));
          
          const { error: studentsError } = await supabase
            .from("session_students")
            .insert(sessionStudentsData);
            
          if (studentsError) {
            throw studentsError;
          }
        }
        
        results.push(newSession);
      }
      
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => {
      toast.error(`Failed to create sessions: ${error.message}`);
    }
  });
};
