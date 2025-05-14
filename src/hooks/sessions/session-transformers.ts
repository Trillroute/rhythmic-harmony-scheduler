
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
  profiles?: { name: string };
  session_students?: Array<{ student_id: string, profiles: { name: string } }>;
}

// Transform database session to frontend session
export function transformSession(dbSession: DbSession): Session {
  // Extract student IDs and names from session_students if available
  const studentIds: string[] = [];
  const studentNames: string[] = [];
  
  if (dbSession.session_students && Array.isArray(dbSession.session_students)) {
    dbSession.session_students.forEach(student => {
      if (student.student_id) {
        studentIds.push(student.student_id);
      }
      if (student.profiles?.name) {
        studentNames.push(student.profiles.name);
      }
    });
  }
  
  return {
    id: dbSession.id,
    teacherId: dbSession.teacher_id,
    teacherName: dbSession.profiles?.name,
    packId: dbSession.pack_id,
    subject: assertSubjectType(dbSession.subject),
    sessionType: assertSessionType(dbSession.session_type),
    location: assertLocationType(dbSession.location),
    dateTime: dbSession.date_time,
    duration: dbSession.duration,
    status: assertAttendanceStatus(dbSession.status),
    notes: dbSession.notes,
    rescheduleCount: dbSession.reschedule_count,
    studentIds: studentIds,
    studentNames: studentNames,
    createdAt: dbSession.created_at,
    updatedAt: dbSession.updated_at
  };
}

// Add the missing transformSessionUpdate function
export function transformSessionUpdate(updates: {
  status?: AttendanceStatus;
  notes?: string;
  dateTime?: Date;
  teacherId?: string;
  duration?: number;
}) {
  const apiUpdates: Record<string, any> = {};
  
  if (updates.status) {
    apiUpdates.status = updates.status;
  }
  
  if (updates.notes !== undefined) {
    apiUpdates.notes = updates.notes;
  }
  
  if (updates.dateTime) {
    apiUpdates.date_time = updates.dateTime.toISOString();
  }
  
  if (updates.teacherId) {
    apiUpdates.teacher_id = updates.teacherId;
  }
  
  if (updates.duration) {
    apiUpdates.duration = updates.duration;
  }
  
  return apiUpdates;
}
