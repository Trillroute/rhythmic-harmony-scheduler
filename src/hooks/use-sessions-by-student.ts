
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Session, FilterOptions } from '@/lib/types';
import { assertStringArray } from '@/lib/type-utils';

export const useSessionsByStudent = (
  studentId: string | undefined, 
  filters?: Partial<FilterOptions>
) => {
  const query = useQuery({
    queryKey: ['sessions', 'student', studentId, filters],
    queryFn: async (): Promise<any[]> => {
      if (!studentId) return [];

      const { data: sessionIds, error: sessionIdsError } = await supabase
        .from('session_students')
        .select('session_id')
        .eq('student_id', studentId);

      if (sessionIdsError) {
        toast({
          title: 'Error fetching sessions',
          description: sessionIdsError.message,
          variant: 'destructive',
        });
        throw sessionIdsError;
      }

      if (!sessionIds || sessionIds.length === 0) {
        return [];
      }

      let query = supabase
        .from('sessions')
        .select(`
          id,
          subject,
          session_type,
          location,
          date_time,
          duration,
          status,
          notes,
          teacher_id,
          teachers:teachers (
            id,
            profiles:profiles (
              name
            )
          )
        `)
        .in('id', sessionIds.map(item => item.session_id))
        .order('date_time', { ascending: false });

      // Apply date filters if provided
      if (filters?.startDate) {
        query = query.gte('date_time', new Date(filters.startDate).toISOString());
      }
      if (filters?.endDate) {
        query = query.lte('date_time', new Date(filters.endDate).toISOString());
      }

      // Apply status filter if provided
      if (filters?.status) {
        // Convert string or array of strings to array safely using assertStringArray
        const statusArray = Array.isArray(filters.status) ? 
          assertStringArray(filters.status) : 
          assertStringArray([filters.status]);
        
        if (statusArray.length > 0) {
          query = query.in('status', statusArray);
        }
      }

      const { data, error } = await query;

      if (error) {
        toast({
          title: 'Error fetching sessions',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }

      // Transform data to match Session type with teacher name
      return (data || []).map((item: any) => ({
        id: item.id,
        teacherId: item.teacher_id,
        teacherName: item.teachers?.profiles?.name,
        subject: item.subject,
        sessionType: item.session_type,
        location: item.location,
        dateTime: item.date_time,
        duration: item.duration,
        status: item.status,
        notes: item.notes,
      }));
    },
    enabled: !!studentId,
  });

  return {
    sessions: query.data || [],
    isLoading: query.isLoading,
    error: query.error
  };
};
