
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FilterOptions } from "@/lib/types";
import { transformSessionsFromDB } from "./session-transformers";
import { Session } from "@/lib/types";
import { 
  assertSubjectType, 
  assertSubjectTypeArray, 
  assertSessionType, 
  assertSessionTypeArray, 
  assertLocationType, 
  assertAttendanceStatus, 
  assertAttendanceStatusArray 
} from "@/lib/type-utils";

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
      query = query.eq("subject", filters.subject.toString());
    }

    if (filters.subjects && filters.subjects.length > 0) {
      // Cast to string array for the Supabase query
      const subjectStrings = filters.subjects.map(s => s.toString());
      query = query.in("subject", subjectStrings);
    }

    if (filters.sessionType) {
      query = query.eq("session_type", filters.sessionType.toString());
    }

    if (filters.sessionTypes && filters.sessionTypes.length > 0) {
      const sessionTypeStrings = filters.sessionTypes.map(s => s.toString());
      query = query.in("session_type", sessionTypeStrings);
    }

    if (filters.location) {
      query = query.eq("location", filters.location.toString());
    }

    if (filters.status) {
      if (Array.isArray(filters.status)) {
        // Cast status array to string[] for Supabase query
        const statusStrings = filters.status.map(s => s.toString());
        query = query.in("status", statusStrings);
      } else {
        query = query.eq("status", filters.status.toString());
      }
    }

    // Always order by date_time
    query = query.order("date_time", { ascending: true });

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    if (!data) return [];

    // Transform to Session type
    return transformSessionsFromDB(data);
  };

  return useQuery({
    queryKey: ["sessions", filters],
    queryFn: fetchSessions,
    enabled,
  });
};
