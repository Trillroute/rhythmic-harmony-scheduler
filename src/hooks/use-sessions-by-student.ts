
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AttendanceStatus, SessionWithStudents } from "@/lib/types";
import { transformSessionWithStudents } from "./sessions/session-transformers";

interface Filters {
  studentId?: string;
  dateRange?: { from: string; to: string };
  status?: AttendanceStatus;
}

export const useSessionsByStudent = (studentId?: string, filters: Omit<Filters, 'studentId'> = {}) => {
  const fetchSessions = async () => {
    if (!studentId) {
      return [];
    }
    
    try {
      let query = supabase
        .from('sessions')
        .select(`
          *,
          profiles:teacher_id(*)
        `);
      
      // Get session IDs for the student
      const { data: sessionStudentsData, error: sessionStudentsError } = await supabase
        .from('session_students')
        .select('session_id')
        .eq('student_id', studentId);
        
      if (sessionStudentsError) {
        throw sessionStudentsError;
      }
      
      if (!sessionStudentsData || sessionStudentsData.length === 0) {
        return [];
      }
      
      // Extract session IDs
      const sessionIds = sessionStudentsData.map(item => item.session_id);
      
      // Filter sessions by these IDs
      query = query.in('id', sessionIds);

      // Add filters
      if (filters.dateRange) {
        query = query.gte('date_time', filters.dateRange.from);
        query = query.lte('date_time', filters.dateRange.to);
      }

      if (filters.status) {
        // Convert AttendanceStatus to string
        const statusString = filters.status.toString();
        query = query.eq('status', statusString);
      }

      const { data: rawSessions, error } = await query;

      if (error) {
        console.error("Error fetching sessions:", error);
        throw error;
      }

      if (!rawSessions || rawSessions.length === 0) {
        return [];
      }

      // Add session_students data to each session
      const sessionsWithStudentData = await Promise.all(rawSessions.map(async (session) => {
        // Get student IDs for this session
        const { data: studentsData } = await supabase
          .from('session_students')
          .select('student_id')
          .eq('session_id', session.id);
          
        return {
          ...session,
          session_students: studentsData || []
        };
      }));

      // Transform the raw sessions
      const transformedSessions = await Promise.all(
        sessionsWithStudentData.map(session => transformSessionWithStudents(session))
      );
      
      return transformedSessions;
    } catch (error) {
      console.error("Error in useSessionsByStudent:", error);
      throw error;
    }
  };

  return useQuery<SessionWithStudents[]>({
    queryKey: ['sessions', 'student', studentId, filters],
    queryFn: fetchSessions,
    enabled: !!studentId, // Only run query if studentId is provided
  });
};
