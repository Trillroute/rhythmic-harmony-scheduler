
import { SessionWithStudents } from "./types";
import { AttendanceStatus, LocationType, SessionType, SubjectType, Session } from "@/lib/types";
import { 
  assertAttendanceStatus, 
  assertLocationType, 
  assertSessionType, 
  assertSubjectType 
} from "@/lib/type-utils";

// Transform raw database data to the SessionWithStudents format
export const transformSessionData = (data: any[]): SessionWithStudents[] => {
  return data.map(session => {
    const studentIds = session.session_students 
      ? session.session_students.map((s: any) => s.student_id) 
      : [];
    
    return {
      id: session.id,
      teacherId: session.teacher_id,
      packId: session.pack_id,
      subject: assertSubjectType(session.subject),
      sessionType: assertSessionType(session.session_type),
      location: assertLocationType(session.location),
      dateTime: session.date_time,
      duration: session.duration,
      notes: session.notes,
      status: assertAttendanceStatus(session.status),
      rescheduleCount: session.reschedule_count || 0, // Ensure it's not undefined
      createdAt: session.created_at,
      updatedAt: session.updated_at,
      studentIds
    };
  });
};

// Transform sessions for compatibility with Session type
export const transformSessionsFromDB = (data: any[]): Session[] => {
  return transformSessionData(data).map(session => ({
    id: session.id,
    teacherId: session.teacherId,
    packId: session.packId,
    subject: session.subject,
    sessionType: session.sessionType,
    location: session.location,
    dateTime: session.dateTime,
    duration: session.duration,
    notes: session.notes,
    status: session.status,
    rescheduleCount: session.rescheduleCount, // This is now explicitly set
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    studentIds: session.studentIds
  }));
};
