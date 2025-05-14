
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { SessionData } from "./types";

export const useCreateSessions = (queryKey: unknown[]) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (sessionDataArray: SessionData[]) => {
      if (!Array.isArray(sessionDataArray) || sessionDataArray.length === 0) {
        throw new Error("Invalid session data");
      }
      
      const sessionsToCreate = [];
      
      for (const sessionData of sessionDataArray) {
        // Validate required fields
        if (!sessionData.teacherId || !sessionData.packId || !sessionData.dateTime) {
          throw new Error("Missing required fields in session data");
        }
        
        // Format session data for the API
        const formattedSession = {
          teacher_id: sessionData.teacherId,
          pack_id: sessionData.packId,
          subject: sessionData.subject,
          session_type: sessionData.sessionType,
          location: sessionData.location,
          date_time: sessionData.dateTime instanceof Date 
            ? sessionData.dateTime.toISOString() 
            : sessionData.dateTime,
          duration: sessionData.duration || 60,
          notes: sessionData.notes || "",
          status: "Scheduled", // Default status
          recurrence_rule: sessionData.recurrenceRule
        };
        
        sessionsToCreate.push(formattedSession);
      }
      
      // Insert the primary session
      const { data: createdSession, error } = await supabase
        .from("sessions")
        .insert(sessionsToCreate[0])
        .select("*")
        .single();
      
      if (error) {
        console.error("Error creating session:", error);
        throw new Error(error.message);
      }
      
      // Add student associations
      if (createdSession && sessionDataArray[0].studentIds?.length > 0) {
        const sessionStudents = sessionDataArray[0].studentIds.map(studentId => ({
          session_id: createdSession.id,
          student_id: studentId
        }));
        
        const { error: studentsError } = await supabase
          .from("session_students")
          .insert(sessionStudents);
        
        if (studentsError) {
          console.error("Error adding students to session:", studentsError);
          // Continue anyway, just log the error
        }
      }
      
      // If it's a recurring session, create recurring instances via RPC
      if (sessionDataArray[0].recurrenceRule && createdSession) {
        await supabase.rpc('create_recurring_sessions', {
          parent_session_id: createdSession.id
        });
      }
      
      return createdSession;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey });
      const dateStr = data?.date_time 
        ? format(new Date(data.date_time), "MMM d, yyyy 'at' h:mm a")
        : "Unknown date";
      toast.success(`Session scheduled for ${dateStr}`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to create session: ${error.message}`);
    }
  });
};
