
import { Session } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";

export const transformSessionWithStudents = async (sessionData: any): Promise<Session> => {
  // Fetch student profiles based on student IDs in session_students
  const studentIds = sessionData.session_students.map((s: any) => s.student_id);

  // Fetch profiles for all student IDs
  let studentProfiles: Record<string, any> = {};
  if (studentIds.length > 0) {
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name, email')
      .in('id', studentIds);

    if (profilesError) {
      console.error('Error fetching student profiles:', profilesError);
    } else if (profilesData) {
      // Index profiles by ID for quick lookup
      studentProfiles = profilesData.reduce((acc, profile) => {
        acc[profile.id] = profile;
        return acc;
      }, {} as Record<string, any>);
    }
  }

  const students = sessionData.session_students.map((student: any) => {
    const profile = studentProfiles[student.student_id];
    return {
      id: student.student_id,
      name: profile?.name || 'Unknown Student',
      email: profile?.email || 'unknown@example.com',
    };
  });

  return {
    id: sessionData.id,
    dateTime: sessionData.date_time,
    duration: sessionData.duration,
    location: sessionData.location,
    notes: sessionData.notes,
    teacherId: sessionData.teacher_id,
    subject: sessionData.subject,
    sessionType: sessionData.session_type,
    status: sessionData.status,
    packId: sessionData.pack_id,
    studentIds: students.map(s => s.id),
    studentNames: students.map(s => s.name),
    rescheduleCount: sessionData.reschedule_count || 0,
    createdAt: sessionData.created_at,
    updatedAt: sessionData.updated_at,
    recurrenceRule: sessionData.recurrence_rule,
    originalSessionId: sessionData.original_session_id,
    rescheduledFrom: sessionData.rescheduled_from,
  };
};

// Fix the transformSessionUpdate function
export const transformSessionUpdate = (sessionData: any) => {
  // Convert camelCase to snake_case for the database
  const result: Record<string, any> = {};
  
  if (sessionData.dateTime !== undefined) result.date_time = sessionData.dateTime;
  if (sessionData.duration !== undefined) result.duration = sessionData.duration;
  if (sessionData.notes !== undefined) result.notes = sessionData.notes;
  if (sessionData.status !== undefined) result.status = sessionData.status;
  if (sessionData.teacherId !== undefined) result.teacher_id = sessionData.teacherId;
  
  return result;
};
