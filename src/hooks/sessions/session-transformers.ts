
import { Session } from "@/lib/types";
import { SessionResult, SessionWithStudents } from "./types";

/**
 * Maps the raw result from Supabase into a proper Session object
 */
export const mapToSession = (result: any): Session => {
  return {
    id: result.id,
    teacher_id: result.teacher_id,
    pack_id: result.pack_id,
    subject: result.subject,
    session_type: result.session_type,
    location: result.location,
    date_time: result.date_time,
    duration: result.duration,
    notes: result.notes || "",
    status: result.status,
    recurrence_rule: result.recurrence_rule || "",
    original_session_id: result.original_session_id || null,
    rescheduled_from: result.rescheduled_from || null,
    created_at: result.created_at,
    updated_at: result.updated_at,
    reschedule_count: result.reschedule_count || 0,
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
    studentIds: students.map((s: any) => s.id),
    students: students.map((s: any) => ({
      id: s.id,
      name: s.name || "Unknown Student",
      email: s.email || ""
    }))
  };
};

/**
 * Transforms the DB result with nested objects into an array of SessionWithStudents
 */
export const transformSessionsResult = (result: SessionResult[]): SessionWithStudents[] => {
  return result.map(mapToSessionWithStudents);
};
