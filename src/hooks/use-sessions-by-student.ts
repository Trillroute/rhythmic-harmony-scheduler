
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@/lib/types";
import { transformSessionWithStudents } from "./sessions/session-transformers";

interface Filters {
  studentId?: string;
  dateRange?: { from: string; to: string };
  status?: string[];
}

export const useSessionsByStudent = (filters: Filters) => {
  const fetchSessions = async () => {
    if (!filters.studentId) {
      return [];
    }
    
    let query = supabase
      .from('sessions')
      .select(`
        *,
        profiles:teacher_id(*),
        session_students(student_id, profiles(*))
      `)
      .eq('session_students.student_id', filters.studentId);

    query = buildQueryFilters(query, filters);

    const { data: rawSessions, error } = await query;

    if (error) {
      console.error("Error fetching sessions:", error);
      throw error;
    }

    // Transform the raw sessions to match our Session type
    return rawSessions.map((session: any) => transformSessionWithStudents(session));
  };

  return useQuery({
    queryKey: ['sessions', 'student', filters],
    queryFn: fetchSessions,
    enabled: !!filters.studentId, // Only run query if studentId is provided
  });
};

// Function to build query filters dynamically
function buildQueryFilters(query: any, filters: Filters) {
  if (filters.dateRange) {
    query = query.gte('date_time', filters.dateRange.from);
    query = query.lte('date_time', filters.dateRange.to);
  }

  // Modify the buildQueryFilters function to properly cast status values
  if (filters.status && filters.status.length > 0) {
    // Cast the status array to string[] to match what Supabase expects
    const statusValues = filters.status as string[];
    query = query.in('status', statusValues);
  }

  return query;
}
