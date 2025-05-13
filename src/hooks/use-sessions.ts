
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../integrations/supabase/client";
import { Session, SubjectType, SessionType, LocationType, AttendanceStatus } from "@/lib/types";
import { toast } from "sonner";

// Define the SessionWithStudents interface here so it can be exported
export interface SessionWithStudents {
  id: string;
  teacherId: string;
  packId: string;
  subject: SubjectType;
  sessionType: SessionType;
  location: LocationType;
  dateTime: string;
  duration: number;
  notes?: string;
  status: AttendanceStatus;
  rescheduleCount?: number;
  createdAt: string;
  updatedAt: string;
  studentIds: string[];
  teacherName?: string;
}

interface SessionsProps {
  teacherId?: string;
  studentId?: string;
  fromDate?: Date;
  toDate?: Date;
  status?: AttendanceStatus[];
}

interface SessionUpdateProps {
  id: string;
  status: AttendanceStatus;
}

interface SessionCreateProps {
  packId: string;
  teacherId: string;
  subject: SubjectType;
  sessionType: SessionType;
  location: LocationType;
  dateTime: Date;
  duration: number;
  notes?: string;
  studentIds?: string[];
}

export const useSessions = (props: SessionsProps = {}) => {
  const queryClient = useQueryClient();
  
  // Construct query key based on filters
  const queryKey = ["sessions", props];
  
  const fetchSessions = async (): Promise<SessionWithStudents[]> => {
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
      query = query.in("status", props.status);
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
  
  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: fetchSessions,
  });
  
  // Mutation for updating session status
  const updateSessionStatusMutation = useMutation({
    mutationFn: async (sessionUpdate: SessionUpdateProps) => {
      const { id, status } = sessionUpdate;
      
      const { data, error } = await supabase
        .from("sessions")
        .update({ status })
        .eq("id", id)
        .select();
        
      if (error) {
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => {
      toast.error(`Failed to update session status: ${error.message}`);
    }
  });
  
  // Mutation for creating new sessions
  const createBulkSessionsMutation = useMutation({
    mutationFn: async (sessionsData: SessionCreateProps[]) => {
      // Create sessions one by one and handle student associations
      const results = [];
      
      for (const sessionData of sessionsData) {
        const { studentIds, ...sessionFields } = sessionData;
        
        // Convert date to ISO string
        const formattedData = {
          teacher_id: sessionFields.teacherId,
          pack_id: sessionFields.packId,
          subject: sessionFields.subject,
          session_type: sessionFields.sessionType,
          location: sessionFields.location,
          date_time: sessionFields.dateTime.toISOString(),
          duration: sessionFields.duration,
          notes: sessionFields.notes || '',
          status: 'Scheduled' as AttendanceStatus
        };
        
        // Create session
        const { data: newSession, error: sessionError } = await supabase
          .from("sessions")
          .insert(formattedData)
          .select();
          
        if (sessionError) {
          throw sessionError;
        }
        
        // If we have studentIds, create session_students records
        if (studentIds && studentIds.length > 0 && newSession && newSession[0]) {
          const sessionStudentsData = studentIds.map(studentId => ({
            session_id: newSession[0].id,
            student_id: studentId
          }));
          
          const { error: studentsError } = await supabase
            .from("session_students")
            .insert(sessionStudentsData);
            
          if (studentsError) {
            throw studentsError;
          }
        }
        
        results.push(newSession);
      }
      
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => {
      toast.error(`Failed to create sessions: ${error.message}`);
    }
  });
  
  return {
    sessions: data,
    isLoading,
    error,
    refetchSessions: () => queryClient.invalidateQueries({ queryKey }),
    updateSessionStatus: updateSessionStatusMutation.mutateAsync,
    createBulkSessions: createBulkSessionsMutation.mutateAsync,
    isPendingCreate: createBulkSessionsMutation.isPending,
    isPendingUpdate: updateSessionStatusMutation.isPending
  };
};
