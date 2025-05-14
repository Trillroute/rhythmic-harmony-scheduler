
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
      // Convert to string for Supabase query using the assertion utility
      const subjectString = assertSubjectType(filters.subject).toString();
      query = query.eq("subject", subjectString);
    }

    if (filters.subjects && filters.subjects.length > 0) {
      // Use assertion utility to ensure proper types then cast to string array
      const subjectArray = assertSubjectTypeArray(filters.subjects);
      const subjectStrings = subjectArray.map(s => s.toString());
      query = query.in("subject", subjectStrings);
    }

    if (filters.sessionType) {
      // Convert to string for Supabase query using the assertion utility
      const sessionTypeString = assertSessionType(filters.sessionType).toString();
      query = query.eq("session_type", sessionTypeString);
    }

    if (filters.sessionTypes && filters.sessionTypes.length > 0) {
      // Use assertion utility to ensure proper types then cast to string array
      const sessionTypeArray = assertSessionTypeArray(filters.sessionTypes);
      const sessionTypeStrings = sessionTypeArray.map(s => s.toString());
      query = query.in("session_type", sessionTypeStrings);
    }

    if (filters.location) {
      // Convert to string for Supabase query using the assertion utility
      const locationString = assertLocationType(filters.location).toString();
      query = query.eq("location", locationString);
    }

    if (filters.status) {
      if (Array.isArray(filters.status)) {
        // Use assertion utility to ensure proper types then cast to string array
        const statusArray = assertAttendanceStatusArray(filters.status);
        const statusStrings = statusArray.map(s => s.toString());
        query = query.in("status", statusStrings);
      } else {
        // Convert to string for Supabase query using the assertion utility
        const statusString = assertAttendanceStatus(filters.status).toString();
        query = query.eq("status", statusString);
      }
    }

    // Always order by date_time
    query = query.order("date_time", { ascending: true });

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching sessions:", error);
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
