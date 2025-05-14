
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { transformSessionsResult } from "./session-transformers";
import { SessionWithStudents } from "../reports/types";
import { AttendanceStatus, SubjectType } from "@/lib/types";
import { assertAttendanceStatusArray, assertSubjectType } from "@/lib/type-utils";

interface UseFetchSessionsOptions {
  startDate?: Date;
  endDate?: Date;
  teacherId?: string;
  studentId?: string;
  status?: AttendanceStatus | AttendanceStatus[];
  subject?: string;
  enabled?: boolean;
}

export const useFetchSessions = (options: UseFetchSessionsOptions = {}) => {
  const {
    startDate,
    endDate,
    teacherId,
    studentId,
    status,
    subject,
    enabled = true,
  } = options;

  return useQuery({
    queryKey: [
      "sessions",
      startDate?.toISOString(),
      endDate?.toISOString(),
      teacherId,
      studentId,
      status,
      subject,
    ],
    queryFn: async () => {
      let query = supabase
        .from("sessions")
        .select(`
          *,
          teacher:profiles!sessions_teacher_id_fkey(id, name, email),
          students:session_students(
            student:profiles!session_students_student_id_fkey(id, name, email)
          )
        `)
        .order("date_time", { ascending: true });

      // Apply filters
      if (startDate) {
        query = query.gte("date_time", startDate.toISOString());
      }

      if (endDate) {
        query = query.lte("date_time", endDate.toISOString());
      }

      if (teacherId) {
        query = query.eq("teacher_id", teacherId);
      }

      if (studentId) {
        query = query.eq("session_students.student_id", studentId);
      }

      if (status) {
        if (Array.isArray(status)) {
          if (status.length > 0) {
            // Convert status array to string array for database query
            const statusValues = assertAttendanceStatusArray(status);
            if (statusValues.length > 0) {
              query = query.in("status", assertStringArray(statusValues));
            }
          }
        } else {
          query = query.eq("status", String(status));
        }
      }

      if (subject) {
        query = query.eq("subject", String(subject));
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      // Transform nested data structure into flat sessions with students
      return transformSessionsResult(data || []);
    },
    enabled,
  });
};
