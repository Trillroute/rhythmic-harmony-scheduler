
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SessionsProps } from "./types";
import { transformSession } from "./session-transformers";
import { 
  assertSubjectType, 
  assertSubjectTypeArray, 
  assertSessionType, 
  assertSessionTypeArray, 
  assertLocationType,
  assertAttendanceStatus,
  assertAttendanceStatusArray
} from "@/lib/type-utils";
import { SessionWithStudents } from "@/lib/types";

export function useFetchSessions(props?: SessionsProps) {
  const [sessions, setSessions] = useState<SessionWithStudents[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Start with a base query
      let query = supabase
        .from("sessions")
        .select(`
          id, 
          subject, 
          session_type, 
          location,
          date_time, 
          duration, 
          status, 
          notes,
          reschedule_count,
          teacher_id,
          pack_id,
          recurrence_rule,
          original_session_id,
          rescheduled_from,
          created_at,
          updated_at,
          profiles(name),
          session_students(student_id, profiles(name))
        `);

      // Apply filters if provided
      if (props?.teacherId) {
        query = query.eq('teacher_id', props.teacherId);
      }

      if (props?.studentId) {
        query = query.eq('session_students.student_id', props.studentId);
      }

      if (props?.fromDate) {
        query = query.gte('date_time', props.fromDate.toISOString());
      }

      if (props?.toDate) {
        query = query.lte('date_time', props.toDate.toISOString());
      }

      if (props?.status && props.status.length > 0) {
        const safeStatus = assertAttendanceStatusArray(props.status);
        query = query.in('status', safeStatus);
      }

      // Execute query and get data
      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      if (!data) {
        setSessions([]);
        return;
      }

      // Transform data to match frontend types
      const transformedSessions = data.map(session => transformSession(session));
      setSessions(transformedSessions);
    } catch (err: any) {
      console.error("Error fetching sessions:", err);
      setError(err.message || "An error occurred while fetching sessions");
    } finally {
      setLoading(false);
    }
  }, [props]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return {
    sessions,
    loading,
    error,
    refreshSessions: fetchSessions,
  };
}
