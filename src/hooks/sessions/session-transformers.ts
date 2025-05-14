import { SessionWithStudents } from '@/lib/types';

/**
 * Takes raw session data from Supabase and transforms it into a SessionWithStudents object
 * with proper typing and normalization
 */
export const transformSessionWithStudents = (rawSession: any): SessionWithStudents => {
  // Extract student IDs and names
  const studentIds = rawSession.session_students?.map((ss: any) => ss.student_id) || [];
  const studentNames = rawSession.session_students?.map((ss: any) => ss.profiles?.name) || [];
  
  // Normalize AttendanceStatus (in case the database has values not in our enum)
  let normalizedStatus = rawSession.status;
  const validStatuses = [
    'Present', 'Absent', 'Scheduled', 'Cancelled by Student', 
    'Cancelled by Teacher', 'Cancelled by School', 'No Show'
  ];
  
  if (!validStatuses.includes(normalizedStatus)) {
    normalizedStatus = 'Scheduled'; // Default to scheduled if we get an invalid status
    console.warn(`Invalid status value found: ${rawSession.status}, defaulting to "Scheduled"`);
  }
  
  return {
    id: rawSession.id,
    teacherId: rawSession.teacher_id,
    teacherName: rawSession.profiles?.name || 'Unknown Teacher',
    packId: rawSession.pack_id,
    subject: rawSession.subject,
    sessionType: rawSession.session_type,
    location: rawSession.location,
    dateTime: rawSession.date_time,
    duration: rawSession.duration,
    status: normalizedStatus,
    notes: rawSession.notes || '',
    rescheduleCount: rawSession.reschedule_count,
    studentIds,
    studentNames,
    createdAt: rawSession.created_at,
    updatedAt: rawSession.updated_at,
    recurrenceRule: rawSession.recurrence_rule,
    originalSessionId: rawSession.original_session_id,
    rescheduledFrom: rawSession.rescheduled_from,
  };
};

/**
 * Transforms session update data from frontend model to API format
 */
export function transformSessionUpdate(updates: {
  status?: string;
  notes?: string;
  dateTime?: Date;
  teacherId?: string;
  duration?: number;
}) {
  const apiUpdates: Record<string, any> = {};
  
  if (updates.status !== undefined) {
    apiUpdates.status = updates.status;
  }
  
  if (updates.notes !== undefined) {
    apiUpdates.notes = updates.notes;
  }
  
  if (updates.dateTime !== undefined) {
    apiUpdates.date_time = updates.dateTime.toISOString();
  }
  
  if (updates.teacherId !== undefined) {
    apiUpdates.teacher_id = updates.teacherId;
  }
  
  if (updates.duration !== undefined) {
    apiUpdates.duration = updates.duration;
  }
  
  return apiUpdates;
}
