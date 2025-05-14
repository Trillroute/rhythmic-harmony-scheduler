
import { SessionWithStudents } from "@/lib/types";
import { 
  assertSubjectType, 
  assertSessionType, 
  assertLocationType,
  assertAttendanceStatus
} from "@/lib/type-utils";

// Function to transform API session data to frontend SessionWithStudents model
export const transformSession = (apiSession: any): SessionWithStudents => {
  const studentIds = apiSession.session_students ? 
    apiSession.session_students.map((ss: any) => ss.student_id) : 
    [];
  
  const teacherName = apiSession.profiles ? apiSession.profiles.name : "";
  
  return {
    id: apiSession.id,
    teacherId: apiSession.teacher_id,
    teacherName: teacherName,
    packId: apiSession.pack_id,
    subject: assertSubjectType(apiSession.subject),
    sessionType: assertSessionType(apiSession.session_type),
    location: assertLocationType(apiSession.location),
    dateTime: apiSession.date_time,
    duration: apiSession.duration,
    status: assertAttendanceStatus(apiSession.status),
    notes: apiSession.notes || "",
    rescheduleCount: apiSession.reschedule_count,
    studentIds: studentIds,
    createdAt: apiSession.created_at,
    updatedAt: apiSession.updated_at,
    recurrenceRule: apiSession.recurrence_rule,
    originalSessionId: apiSession.original_session_id,
    rescheduledFrom: apiSession.rescheduled_from
  };
};

// Function to transform frontend session update to API format
export const transformSessionUpdate = (update: any) => {
  const apiUpdate: Record<string, any> = {};
  
  // Map keys to snake_case for the API
  if (update.status !== undefined) apiUpdate.status = update.status;
  if (update.notes !== undefined) apiUpdate.notes = update.notes;
  if (update.dateTime !== undefined) apiUpdate.date_time = update.dateTime;
  if (update.teacherId !== undefined) apiUpdate.teacher_id = update.teacherId;
  if (update.duration !== undefined) apiUpdate.duration = update.duration;
  if (update.recurrenceRule !== undefined) apiUpdate.recurrence_rule = update.recurrenceRule;
  
  return apiUpdate;
};
