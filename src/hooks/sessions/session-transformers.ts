
// This file defines functions for transforming session data between database format and app format
import { Session, SessionWithStudents, AttendanceStatus, LocationType, SessionType, SubjectType } from '@/lib/types';
import { assertAttendanceStatus, assertLocationType, assertSessionType, assertSubjectType } from '@/lib/type-utils';

// Map session data from the database to the frontend Session type
export const transformSessionWithStudents = (sessionData: any): SessionWithStudents => {
  // Extract student data from the joined session_students relation
  const students = sessionData.session_students || [];
  const studentIds = students.map((s: any) => s.student_id);
  const studentNames = students
    .filter((s: any) => s.profiles)
    .map((s: any) => s.profiles.name);

  // Extract teacher name from the joined profiles relation
  const teacherName = sessionData.profiles ? sessionData.profiles.name : 'Unknown';

  // Transform the session data
  return {
    id: sessionData.id,
    teacherId: sessionData.teacher_id,
    teacherName: teacherName,
    packId: sessionData.pack_id,
    subject: assertSubjectType(sessionData.subject),
    sessionType: assertSessionType(sessionData.session_type),
    location: assertLocationType(sessionData.location),
    dateTime: sessionData.date_time,
    duration: sessionData.duration,
    status: assertAttendanceStatus(sessionData.status),
    notes: sessionData.notes || '',
    studentIds: studentIds,
    studentNames: studentNames,
    rescheduleCount: sessionData.reschedule_count || 0,
    createdAt: sessionData.created_at,
    updatedAt: sessionData.updated_at,
    recurrenceRule: sessionData.recurrence_rule,
    originalSessionId: sessionData.original_session_id,
    rescheduledFrom: sessionData.rescheduled_from
  };
};

// Transform data for updating a session
export const transformSessionUpdate = (updateData: Partial<Session>) => {
  const updates: Record<string, any> = {};

  // Map camelCase properties to snake_case for the database
  if (updateData.teacherId !== undefined) updates.teacher_id = updateData.teacherId;
  if (updateData.packId !== undefined) updates.pack_id = updateData.packId;
  if (updateData.subject !== undefined) updates.subject = updateData.subject;
  if (updateData.sessionType !== undefined) updates.session_type = updateData.sessionType;
  if (updateData.location !== undefined) updates.location = updateData.location;
  if (updateData.dateTime !== undefined) updates.date_time = updateData.dateTime;
  if (updateData.duration !== undefined) updates.duration = updateData.duration;
  if (updateData.status !== undefined) updates.status = updateData.status;
  if (updateData.notes !== undefined) updates.notes = updateData.notes;
  if (updateData.rescheduleCount !== undefined) updates.reschedule_count = updateData.rescheduleCount;
  if (updateData.recurrenceRule !== undefined) updates.recurrence_rule = updateData.recurrenceRule;
  if (updateData.originalSessionId !== undefined) updates.original_session_id = updateData.originalSessionId;
  if (updateData.rescheduledFrom !== undefined) updates.rescheduled_from = updateData.rescheduledFrom;

  return updates;
};
