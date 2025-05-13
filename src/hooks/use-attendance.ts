
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { AttendanceEvent, FilterOptions } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';

// Fetch attendance events with optional filtering
export const useAttendanceEvents = (filters: FilterOptions = {}) => {
  const { userRole, user } = useAuth();
  
  return useQuery({
    queryKey: ['attendance-events', filters],
    queryFn: async () => {
      let query = supabase
        .from('attendance_events')
        .select(`
          id,
          session_id,
          status,
          marked_by_user_id,
          marked_at,
          notes,
          created_at,
          updated_at,
          sessions (
            teacher_id,
            date_time,
            subject,
            session_type,
            session_students (
              student_id
            ),
            teachers (
              profiles (
                name
              )
            )
          ),
          profiles (
            name
          )
        `)
        .order('marked_at', { ascending: false });
      
      // Apply role-based filtering
      if (userRole === 'teacher' && user) {
        query = query.eq('sessions.teacher_id', user.id);
      }
      
      const { data, error } = await query;
      
      if (error) {
        toast({
          title: 'Error fetching attendance events',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }
      
      // Transform data to match AttendanceEvent type
      return data.map((item: any) => ({
        id: item.id,
        sessionId: item.session_id,
        status: item.status,
        markedByUserId: item.marked_by_user_id,
        markedByName: item.profiles.name,
        markedAt: new Date(item.marked_at),
        notes: item.notes,
        sessionDate: new Date(item.sessions.date_time),
        teacherName: item.sessions.teachers.profiles.name,
        subject: item.sessions.subject,
        sessionType: item.sessions.session_type,
        studentIds: item.sessions.session_students.map((s: any) => s.student_id),
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at)
      } as AttendanceEvent & {
        sessionDate: Date;
        teacherName: string;
        subject: string;
        sessionType: string;
        markedByName: string;
        studentIds: string[];
      }));
    },
  });
};
