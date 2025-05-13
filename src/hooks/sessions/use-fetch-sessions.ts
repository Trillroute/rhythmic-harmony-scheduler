
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FilterOptions } from "@/lib/types";
import { transformSessionsFromDB } from "./session-transformers";
import { Session } from "@/lib/types";

export const useFetchSessions = (
  filters: FilterOptions = {},
  enabled: boolean = true
) => {
  const fetchSessions = async (): Promise<Session[]> => {
    let query = supabase
      .from("sessions")
      .select("*, session_students(student_id)");

    // Apply filters if present
    if (filters.teacherId) {
      query = query.eq("teacher_id", filters.teacherId);
    }

    if (filters.startDate) {
      query = query.gte("date_time", new Date(filters.startDate).toISOString());
    }

    if (filters.endDate) {
      query = query.lte("date_time", new Date(filters.endDate).toISOString());
    }

    if (filters.subject) {
      query = query.eq("subject", filters.subject);
    }

    if (filters.subjects && filters.subjects.length > 0) {
      query = query.in("subject", filters.subjects.map(s => s.toString()) as string[]);
    }

    if (filters.sessionType) {
      query = query.eq("session_type", filters.sessionType);
    }

    if (filters.sessionTypes && filters.sessionTypes.length > 0) {
      query = query.in("session_type", filters.sessionTypes);
    }

    if (filters.location) {
      query = query.eq("location", filters.location);
    }

    if (filters.status) {
      if (Array.isArray(filters.status)) {
        // Cast status array to string[] for Supabase query
        query = query.in("status", filters.status.map(s => s.toString()) as string[]);
      } else {
        query = query.eq("status", filters.status);
      }
    }

    // Always order by date_time
    query = query.order("date_time", { ascending: true });

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    if (!data) return [];

    return transformSessionsFromDB(data);
  };

  return useQuery({
    queryKey: ["sessions", filters],
    queryFn: fetchSessions,
    enabled,
  });
};
