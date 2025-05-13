
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Session, AttendanceStatus, FilterOptions } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { checkSessionConflicts } from '@/lib/utils';

// Helper to build the filter query
const buildFilterQuery = (query: any, filters: FilterOptions) => {
  if (filters.teachers && filters.teachers.length > 0) {
    query = query.in('teacher_id', filters.teachers);
  }
  
  if (filters.subjects && filters.subjects.length > 0) {
    query = query.in('subject', filters.subjects);
  }
  
  if (filters.sessionTypes && filters.sessionTypes.length > 0) {
    query = query.in('session_type', filters.sessionTypes);
  }
  
  if (filters.locations && filters.locations.length > 0) {
    query = query.in('location', filters.locations);
  }
  
  if (filters.status && filters.status.length > 0) {
    query = query.in('status', filters.status);
  }
  
  if (filters.startDate) {
    query = query.gte('date_time', filters.startDate.toISOString());
  }
  
  if (filters.endDate) {
    query = query.lte('date_time', filters.endDate.toISOString());
  }
  
  return query;
};

// Fetch sessions with optional filtering
export const useSessions = (filters: FilterOptions = {}) => {
  const { userRole, user } = useAuth();
  
  return useQuery({
    queryKey: ['sessions', filters],
    queryFn: async () => {
      let query = supabase
        .from('sessions')
        .select(`
          id,
          pack_id,
          teacher_id,
          subject,
          session_type,
          location,
          date_time,
          duration,
          status,
          reschedule_count,
          notes,
          created_at,
          updated_at,
          session_students (
            student_id
          ),
          teachers (
            profiles (
              name
            )
          )
        `)
        .order('date_time', { ascending: true });
      
      // Apply role-based filtering
      if (userRole === 'teacher' && user) {
        query = query.eq('teacher_id', user.id);
      } else if (userRole === 'student' && user) {
        // For students, we need a more complex query that we handle in the RLS policies
      }
      
      // Apply user-specified filters
      query = buildFilterQuery(query, filters);
      
      const { data, error } = await query;
      
      if (error) {
        toast({
          title: 'Error fetching sessions',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }
      
      // Transform data to match Session type
      return data.map((item: any) => ({
        id: item.id,
        packId: item.pack_id,
        teacherId: item.teacher_id,
        studentIds: item.session_students.map((s: any) => s.student_id),
        subject: item.subject,
        sessionType: item.session_type,
        location: item.location,
        dateTime: new Date(item.date_time),
        duration: item.duration,
        status: item.status as AttendanceStatus,
        rescheduleCount: item.reschedule_count,
        notes: item.notes,
        teacherName: item.teachers.profiles.name,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at)
      } as Session & { teacherName: string }));
    },
  });
};

// Create a new session
export const useCreateSession = () => {
  const queryClient = useQueryClient();
  const { data: allSessions } = useSessions();
  
  return useMutation({
    mutationFn: async (sessionData: Partial<Session>) => {
      // Check for conflicts before creating
      if (allSessions) {
        // Check for teacher conflicts
        const teacherConflict = checkSessionConflicts(sessionData, allSessions, 'teacher');
        if (teacherConflict.hasConflict) {
          throw new Error(`Teacher is already booked during this time slot`);
        }
        
        // Check for student conflicts
        const studentConflict = checkSessionConflicts(sessionData, allSessions, 'student');
        if (studentConflict.hasConflict) {
          throw new Error(`Student is already booked during this time slot`);
        }
        
        // For duo sessions, check if we're trying to add more than 2 students
        if (sessionData.sessionType === 'Duo' && sessionData.studentIds && sessionData.studentIds.length > 2) {
          throw new Error('Duo sessions can have a maximum of 2 students');
        }
      }
      
      const { data, error } = await supabase
        .from('sessions')
        .insert([
          {
            pack_id: sessionData.packId,
            teacher_id: sessionData.teacherId,
            subject: sessionData.subject,
            session_type: sessionData.sessionType,
            location: sessionData.location,
            date_time: sessionData.dateTime?.toISOString(),
            duration: sessionData.duration,
            status: sessionData.status || 'Scheduled',
            notes: sessionData.notes
          }
        ])
        .select('id')
        .single();
      
      if (error) {
        throw error;
      }
      
      // If there are student IDs and it's a duo session, add them to session_students
      if (sessionData.studentIds && sessionData.studentIds.length > 0) {
        const sessionStudentPromises = sessionData.studentIds.map(studentId => 
          supabase
            .from('session_students')
            .insert({ session_id: data.id, student_id: studentId })
        );
        
        await Promise.all(sessionStudentPromises);
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast({
        title: 'Success',
        description: 'Session created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error creating session',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Update a session's status
export const useUpdateSessionStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ sessionId, status }: { sessionId: string, status: AttendanceStatus }) => {
      const { data, error } = await supabase
        .from('sessions')
        .update({ status })
        .eq('id', sessionId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-events'] });
      toast({
        title: 'Success',
        description: 'Session status updated',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error updating status',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Reschedule a session 
export const useRescheduleSession = () => {
  const queryClient = useQueryClient();
  const { data: allSessions } = useSessions();
  
  return useMutation({
    mutationFn: async ({ 
      sessionId, 
      newDateTime,
      reason = 'Rescheduled by admin'
    }: { 
      sessionId: string, 
      newDateTime: Date,
      reason?: string 
    }) => {
      // First get the current session data
      const { data: currentSession, error: fetchError } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', sessionId)
        .single();
        
      if (fetchError) throw fetchError;
      
      // Check if session has already been rescheduled
      if (currentSession.reschedule_count >= 1) {
        throw new Error('This session has already been rescheduled once and cannot be rescheduled again.');
      }
      
      // Check if the session is in the correct status to be rescheduled
      if (currentSession.status !== 'Cancelled by Student') {
        throw new Error('Only sessions cancelled by students can be rescheduled.');
      }
      
      // Check for conflicts with new time
      if (allSessions) {
        const sessionData = {
          id: sessionId,
          teacherId: currentSession.teacher_id,
          dateTime: newDateTime,
          duration: currentSession.duration
        };
        
        const teacherConflict = checkSessionConflicts(sessionData, allSessions, 'teacher');
        if (teacherConflict.hasConflict) {
          throw new Error(`Teacher is already booked during this time slot`);
        }
        
        // Get students for this session
        const { data: sessionStudents, error: studentsError } = await supabase
          .from('session_students')
          .select('student_id')
          .eq('session_id', sessionId);
          
        if (studentsError) throw studentsError;
        
        const studentIds = sessionStudents.map(item => item.student_id);
        const sessionDataWithStudents = {
          ...sessionData,
          studentIds
        };
        
        const studentConflict = checkSessionConflicts(sessionDataWithStudents, allSessions, 'student');
        if (studentConflict.hasConflict) {
          throw new Error(`Student is already booked during this time slot`);
        }
      }
      
      // Update the session with the new date time and increment reschedule count
      const { data, error } = await supabase
        .from('sessions')
        .update({ 
          date_time: newDateTime.toISOString(),
          status: 'Scheduled',
          reschedule_count: currentSession.reschedule_count + 1
        })
        .eq('id', sessionId)
        .select()
        .single();
      
      if (error) throw error;
      
      // Record the reschedule in history
      const { error: historyError } = await supabase
        .from('reschedule_history')
        .insert({
          session_id: sessionId,
          original_date_time: currentSession.date_time,
          new_date_time: newDateTime.toISOString(),
          rescheduled_by_user_id: (await supabase.auth.getUser()).data.user?.id,
          reason,
          status: 'Approved'
        });
        
      if (historyError) throw historyError;
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['reschedule-history'] });
      toast({
        title: 'Success',
        description: 'Session rescheduled successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error rescheduling session',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
