
import { SessionType, SubjectType, LocationType, AttendanceStatus, Session } from "@/lib/types";
import { assertSubjectType, assertSessionType, assertLocationType, assertAttendanceStatus } from "@/lib/type-utils";

// Add a type definition for the database session
export interface DbSession {
  id: string;
  teacher_id: string;
  pack_id: string;
  subject: string;
  session_type: string;
  location: string;
  date_time: string;
  duration: number;
  status: string;
  notes?: string;
  reschedule_count: number;
  created_at: string;
  updated_at: string;
  teacher_name?: string;
  student_ids?: string[];
  student_names?: string[];
}

// Transform database session to frontend session
export function transformDbSessionToSession(dbSession: DbSession): Session {
  return {
    id: dbSession.id,
    teacherId: dbSession.teacher_id,
    teacherName: dbSession.teacher_name,
    packId: dbSession.pack_id,
    subject: assertSubjectType(dbSession.subject),
    sessionType: assertSessionType(dbSession.session_type),
    location: assertLocationType(dbSession.location),
    dateTime: dbSession.date_time,
    duration: dbSession.duration,
    status: assertAttendanceStatus(dbSession.status),
    notes: dbSession.notes,
    rescheduleCount: dbSession.reschedule_count,
    studentIds: dbSession.student_ids || [],
    studentNames: dbSession.student_names,
    createdAt: dbSession.created_at,
    updatedAt: dbSession.updated_at
  };
}
