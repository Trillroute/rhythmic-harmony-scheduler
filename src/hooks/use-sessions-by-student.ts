
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AttendanceStatus } from "@/lib/types";

export interface UseSessionsByStudentOptions {
  status?: AttendanceStatus | AttendanceStatus[];
  startDate?: Date;
  endDate?: Date;
  enabled?: boolean;
}

export const useSessionsByStudent = (
  studentId: string,
  options: UseSessionsByStudentOptions = {}
) => {
  // Destructure options with defaults
  const { status, startDate, endDate, enabled = true } = options;

  return useQuery({
    queryKey: ["student-sessions", studentId, status, startDate, endDate],
    queryFn: async () => {
      if (!studentId) {
        return { data: [] };
      }

      // Base query to get all sessions for this student
      let query = supabase
        .from("sessions")
        .select(
          `
          *,
          teacher:teacher_id(
            id,
            name:profiles!teachers_id_fkey(name)
          )
        `
        )
        .order("date_time", { ascending: false });

      // Join with session_students to find sessions for this student
      query = query.filter("session_students.student_id", "eq", studentId);

      // Filter by status if provided
      if (status) {
        if (Array.isArray(status)) {
          // Convert to array of strings to avoid enum mismatch
          const statusStrings = status.map(s => String(s));
          query = query.in("status", statusStrings);
        } else {
          // Convert to string to avoid enum mismatch
          query = query.eq("status", String(status));
        }
      }

      // Filter by date range if provided
      if (startDate) {
        query = query.gte("date_time", startDate.toISOString());
      }

      if (endDate) {
        query = query.lte("date_time", endDate.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      // Transform the data to include teacher name for easier access
      const transformedData = data.map(session => ({
        ...session,
        teacherName: session.teacher?.name || "Unknown Teacher"
      }));

      return { data: transformedData };
    },
    enabled: enabled && !!studentId,
  });
};

// Add a type guard for backward compatibility
export const isSessionsQueryResult = (
  result: unknown
): result is { data: any[] } => {
  return (
    typeof result === "object" &&
    result !== null &&
    "data" in result &&
    Array.isArray((result as any).data)
  );
};
