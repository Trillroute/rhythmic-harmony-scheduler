import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@/lib/types";

interface Filters {
  studentId?: string;
  dateRange?: { from: string; to: string };
  status?: string[];
}

export const useSessionsByStudent = (filters: Filters) => {
  const fetchSessions = async () => {
    let query = supabase
      .from('sessions')
      .select('*')
      .eq('student_id', filters.studentId);

    query = buildQueryFilters(query, filters);

    const { data: sessions, error } = await query;

    if (error) {
      console.error("Error fetching sessions:", error);
      throw error;
    }

    return sessions as Session[];
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
    query = query.gte('date', filters.dateRange.from);
    query = query.lte('date', filters.dateRange.to);
  }

  // Modify the buildQueryFilters function to properly cast status values
  if (filters.status && filters.status.length > 0) {
    // Cast the status array to string[] to match what Supabase expects
    const statusValues = filters.status as string[];
    query = query.in('status', statusValues);
  }

  return query;
}
