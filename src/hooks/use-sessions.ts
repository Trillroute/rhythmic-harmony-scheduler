
// Import React to use React.useMemo
import React from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Session, FilterOptions, SubjectType, SessionType, LocationType, AttendanceStatus, SessionWithStudents } from "@/lib/types";
import { format } from 'date-fns';

export const useSessions = (filter: FilterOptions = {}) => {
  const queryClient = useQueryClient();

  // Fetch sessions with applied filters
  const { data: sessions, isLoading, error, refetch: refetchSessions } = useQuery({
    queryKey: ['sessions', filter],
    queryFn: async () => {
      let query = supabase
        .from('sessions')
        .select(`
          *,
          session_students (
            student_id
          ),
          teachers!inner (
            profiles!inner (
              name
            )
          )
        `)
        .order('date_time', { ascending: false });
      
      if (filter.teacherId) {
        query = query.eq('teacher_id', filter.teacherId);
      }
      
      if (filter.subject) {
        query = query.eq('subject', filter.subject);
      }
      
      if (filter.sessionType) {
        query = query.eq('session_type', filter.sessionType);
      }
      
      if (filter.location) {
        query = query.eq('location', filter.location);
      }
      
      if (filter.startDate) {
        const startDateStr = typeof filter.startDate === 'string' 
          ? filter.startDate 
          : filter.startDate.toISOString();
        query = query.gte('date_time', startDateStr);
      }
      
      if (filter.endDate) {
        const endDateStr = typeof filter.endDate === 'string' 
          ? filter.endDate 
          : filter.endDate.toISOString();
        query = query.lte('date_time', endDateStr);
      }
      
      if (filter.status) {
        if (Array.isArray(filter.status)) {
          query = query.in('status', filter.status);
        } else {
          query = query.eq('status', filter.status);
        }
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      // Transform the data to include student IDs and convert from snake_case to camelCase
      const sessionsWithStudents = data?.map(session => {
        const studentIds = session.session_students?.map((ss: any) => ss.student_id) || [];
        
        return {
          id: session.id,
          teacherId: session.teacher_id,
          teacherName: session.teachers?.profiles?.name,
          packId: session.pack_id,
          subject: session.subject,
          sessionType: session.session_type,
          location: session.location,
          dateTime: format(new Date(session.date_time), 'PPP'),
          duration: session.duration,
          status: session.status,
          notes: session.notes || '',
          rescheduleCount: session.reschedule_count,
          studentIds: studentIds,
          createdAt: session.created_at,
          updatedAt: session.updated_at
        } as SessionWithStudents;
      });
      
      return sessionsWithStudents || [];
    }
  });

  // Create bulk sessions mutation
  const createBulkMutation = useMutation({
    mutationFn: async (sessions: Array<{
      pack_id: string;
      teacher_id: string;
      subject: SubjectType;
      session_type: SessionType;
      location: LocationType;
      date_time: string | Date;
      duration: number;
      status?: AttendanceStatus;
      notes?: string;
      studentIds?: string[];
    }>) => {
      // Format dates to ISO string
      const formattedSessions = sessions.map(session => ({
        ...session,
        date_time: typeof session.date_time === 'string' 
          ? session.date_time 
          : session.date_time.toISOString(),
        status: session.status || 'Scheduled'
      }));
      
      // Insert the sessions
      const { data, error } = await supabase
        .from('sessions')
        .insert(formattedSessions.map(({ studentIds, ...rest }) => rest))
        .select('*');
      
      if (error) throw error;
      
      // Handle student associations for sessions
      if (data) {
        // Process each session that has studentIds
        const studentInserts = data.flatMap((session, index) => {
          const studentIds = sessions[index].studentIds;
          if (!studentIds || studentIds.length === 0) return [];
          
          return studentIds.map(studentId => ({
            session_id: session.id,
            student_id: studentId
          }));
        });
        
        if (studentInserts.length > 0) {
          const { error: studentError } = await supabase
            .from('session_students')
            .insert(studentInserts);
          
          if (studentError) throw studentError;
        }
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast.success('Sessions created successfully');
    },
    onError: (error: any) => {
      toast.error(`Error creating sessions: ${error.message}`);
    }
  });

  // Update session status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: AttendanceStatus }) => {
      const { data, error } = await supabase
        .from('sessions')
        .update({ status })
        .eq('id', id)
        .select();
      
      if (error) throw error;
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast.success('Session status updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Error updating session status: ${error.message}`);
    }
  });

  // Export the full hook object
  return {
    sessions,
    isLoading,
    error,
    refetchSessions,
    createBulkSessions: createBulkMutation.mutateAsync,
    updateSessionStatus: updateStatusMutation.mutateAsync,
    isPendingBulkCreate: createBulkMutation.isPending
  };
};

// Create a separate hook for creating sessions
export const useCreateSession = () => {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: async (sessionData: {
      pack_id: string;
      teacher_id: string;
      subject: SubjectType;
      session_type: SessionType;
      location: LocationType;
      date_time: string | Date;
      duration: number;
      status?: AttendanceStatus;
      notes?: string;
      studentIds?: string[];
    }) => {
      // Format date to ISO string if it's a Date object
      const formattedData = {
        ...sessionData,
        date_time: typeof sessionData.date_time === 'string' 
          ? sessionData.date_time 
          : sessionData.date_time.toISOString(),
        status: sessionData.status || 'Scheduled'
      };
      
      // Remove studentIds from the session insert since it's not a column
      const { studentIds, ...sessionInsertData } = formattedData;
      
      // Insert the session
      const { data, error } = await supabase
        .from('sessions')
        .insert(sessionInsertData)
        .select('*')
        .single();
      
      if (error) throw error;
      
      // If students were provided, associate them with the session
      if (studentIds && studentIds.length > 0 && data) {
        const sessionStudents = studentIds.map(studentId => ({
          session_id: data.id,
          student_id: studentId
        }));
        
        const { error: studentError } = await supabase
          .from('session_students')
          .insert(sessionStudents);
        
        if (studentError) throw studentError;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast.success('Session created successfully');
    },
    onError: (error: any) => {
      toast.error(`Error creating session: ${error.message}`);
    }
  });
  
  return {
    createSession: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error
  };
};

// Add a hook for updating session status
export const useUpdateSessionStatus = () => {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: AttendanceStatus }) => {
      const { data, error } = await supabase
        .from('sessions')
        .update({ status })
        .eq('id', id)
        .select();
      
      if (error) throw error;
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast.success('Session status updated');
    },
    onError: (error: any) => {
      toast.error(`Error updating session status: ${error.message}`);
    }
  });
  
  return mutation;
};
