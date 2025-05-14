
import { Session } from "@/lib/types";
import { SessionResult, SessionWithStudents } from "./types";

/**
 * Maps the raw result from Supabase into a proper Session object
 */
export const mapToSession = (result: any): Session => {
  return {
    id: result.id,
    teacherId: result.teacher_id,
    packId: result.pack_id,
    subject: result.subject,
    sessionType: result.session_type,
    location: result.location,
    dateTime: result.date_time,
    duration: result.duration,
    notes: result.notes || "",
    status: result.status,
    recurrenceRule: result.recurrence_rule || "",
    originalSessionId: result.original_session_id || null,
    rescheduledFrom: result.rescheduled_from || null,
    createdAt: result.created_at,
    updatedAt: result.updated_at,
    rescheduleCount: result.reschedule_count || 0,
    studentIds: [],  // Will be populated separately
  };
};

/**
 * Maps the raw result including joined teacher and students
 */
export const mapToSessionWithStudents = (result: any): SessionWithStudents => {
  const session = mapToSession(result);
  
  // Map teacher name
  const teacherName = result.teacher?.name || "Unknown";
  
  // Map student information
  const students = result.students || [];
  
  return {
    ...session,
    teacherName,
    studentIds: students.map((s: any) => s.student.id),
    studentNames: students.map((s: any) => s.student.name || "Unknown Student"),
    students: students.map((s: any) => s.student)
  } as unknown as SessionWithStudents;
};

/**
 * Transforms the DB result with nested objects into an array of SessionWithStudents
 */
export const transformSessionsResult = (result: SessionResult[]): SessionWithStudents[] => {
  return result.map(mapToSessionWithStudents);
};
