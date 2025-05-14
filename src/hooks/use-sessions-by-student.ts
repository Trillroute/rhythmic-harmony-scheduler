
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
    
    let query = supabase
      .from('sessions')
      .select(`
        *,
        profiles:teacher_id(*),
        session_students(student_id, profiles(*))
      `)
      .eq('session_students.student_id', studentId);

    // Add filters
    if (filters.dateRange) {
      query = query.gte('date_time', filters.dateRange.from);
      query = query.lte('date_time', filters.dateRange.to);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    const { data: rawSessions, error } = await query;

    if (error) {
      console.error("Error fetching sessions:", error);
      throw error;
    }

    // Transform the raw sessions to match our SessionWithStudents type
    return rawSessions.map((session: any) => transformSessionWithStudents(session));
  };

  return useQuery<SessionWithStudents[], Error>({
    queryKey: ['sessions', 'student', studentId, filters],
    queryFn: fetchSessions,
    enabled: !!studentId, // Only run query if studentId is provided
  });
};
