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
    students: students,
    teacher: {
      id: sessionData.profiles.id,
      name: sessionData.profiles.name,
      email: sessionData.profiles.email,
    },
  };
};

// Add this function if it doesn't exist yet
export const transformSessionUpdate = async (sessionData) => {
  // Just return the raw session data for now, we can enhance this later if needed
  return sessionData;
};
