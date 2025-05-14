
import { AttendanceStatus, LocationType, SessionType, SubjectType } from "@/lib/types";
import { SessionResult, SessionWithStudents } from "./types";

/**
 * Transform session result from API to our internal format
 */
export const transformSessionsResult = (sessions: any[]): SessionWithStudents[] => {
  if (!sessions || !Array.isArray(sessions)) return [];

  return sessions.map((session) => {
    // Extract student details from the nested structure
    const students = session.students || [];
    const studentIds = students.map((s: any) => s.student?.id || '').filter(Boolean);
    const studentNames = students.map((s: any) => s.student?.name || '').filter(Boolean);
    
    // Get teacher name
    const teacherName = session.teacher?.name || "Unknown Teacher";

    return {
      id: session.id,
      teacherId: session.teacher_id,
      teacherName,
      packId: session.pack_id,
      subject: session.subject as SubjectType,
      sessionType: session.session_type as SessionType,
      location: session.location as LocationType,
      dateTime: session.date_time,
      duration: session.duration,
      status: session.status as AttendanceStatus,
      notes: session.notes || '',
      rescheduleCount: session.reschedule_count || 0,
      studentIds,
      studentNames,
      createdAt: session.created_at,
      updatedAt: session.updated_at,
      recurrenceRule: session.recurrence_rule,
      originalSessionId: session.original_session_id,
      rescheduledFrom: session.rescheduled_from,
    };
  });
};
