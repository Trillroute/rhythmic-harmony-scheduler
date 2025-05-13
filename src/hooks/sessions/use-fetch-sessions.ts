
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SessionsProps } from "./types";
import { transformSessionData } from "./session-transformers";
import { AttendanceStatus } from "@/lib/types";

// Hook for fetching sessions with filters
export const useFetchSessions = (props: SessionsProps = {}) => {
  const queryKey = ["sessions", props];
  
  const fetchSessions = async () => {
    // Build query based on props
    let query = supabase.from("sessions").select(`
      id, 
      teacher_id, 
      pack_id, 
      subject, 
      session_type, 
      location, 
      date_time, 
      duration, 
      notes, 
      status, 
      reschedule_count, 
      created_at, 
      updated_at,
      session_students(student_id)
    `);
    
    // Apply filters
    if (props.teacherId) {
      query = query.eq("teacher_id", props.teacherId);
    }
    
    if (props.fromDate) {
      query = query.gte("date_time", props.fromDate.toISOString());
    }
    
    if (props.toDate) {
      query = query.lte("date_time", props.toDate.toISOString());
    }
    
    if (props.status && props.status.length > 0) {
      // Cast the array to AttendanceStatus[] to fix the type error
      query = query.in("status", props.status as AttendanceStatus[]);
    }
    
    // If studentId is provided, we need to filter by session_students
    if (props.studentId) {
      query = query.eq("session_students.student_id", props.studentId);
    }
    
    const { data, error } = await query.order('date_time', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    // Transform data to match our interface
    return transformSessionData(data);
  };
  
  return useQuery({
    queryKey,
    queryFn: fetchSessions,
  });
};
