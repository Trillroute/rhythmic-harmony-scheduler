
import { SessionWithStudents } from "./types";

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
      subject: session.subject,
      sessionType: session.session_type,
      location: session.location,
      dateTime: session.date_time,
      duration: session.duration,
      notes: session.notes,
      status: session.status,
      rescheduleCount: session.reschedule_count,
      createdAt: session.created_at,
      updatedAt: session.updated_at,
      studentIds
    };
  });
};
