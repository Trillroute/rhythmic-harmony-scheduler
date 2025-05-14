
import { Session, SessionWithStudents } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";

/**
 * Transforms a raw session from Supabase into a SessionWithStudents object
 * Handles fetching student names if needed
 */
export const transformSessionWithStudents = async (rawSession: any): Promise<SessionWithStudents> => {
  // Extract student IDs from session_students array
  const studentIds = rawSession.session_students?.map((s: any) => s.student_id) || [];
  
  // Fetch student names if we have student IDs
  let studentNames: string[] = [];
  if (studentIds.length > 0) {
    try {
      const { data: students } = await supabase
        .from('profiles')
        .select('id, name')
        .in('id', studentIds);
      
      if (students && students.length > 0) {
        // Map student IDs to their names, preserving order
        studentNames = studentIds.map(id => {
          const student = students.find(s => s.id === id);
          return student ? student.name : 'Unknown Student';
        });
      }
    } catch (error) {
      console.error("Error fetching student names:", error);
    }
  }
  
  // Get teacher name if available
  const teacherName = rawSession.profiles?.name || 'Unknown Teacher';
  
  // Transform to our SessionWithStudents type
  return {
    id: rawSession.id,
    teacherId: rawSession.teacher_id,
    teacherName,
    packId: rawSession.pack_id,
    subject: rawSession.subject,
    sessionType: rawSession.session_type,
    location: rawSession.location,
    dateTime: rawSession.date_time,
    duration: rawSession.duration,
    status: rawSession.status,
    notes: rawSession.notes || '',
    studentIds,
    studentNames,
    rescheduleCount: rawSession.reschedule_count || 0,
    createdAt: rawSession.created_at,
    updatedAt: rawSession.updated_at,
    recurrenceRule: rawSession.recurrence_rule || undefined,
    originalSessionId: rawSession.original_session_id || undefined,
    rescheduledFrom: rawSession.rescheduled_from || undefined
  };
};
