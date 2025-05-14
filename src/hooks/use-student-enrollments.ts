
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Enrollment {
  id: string;
  courseName: string;
  status: string;
  startDate: string | Date;
  completionPercentage: number;
}

export const useStudentEnrollments = (studentId: string | undefined) => {
  const query = useQuery({
    queryKey: ['student-enrollments', studentId],
    queryFn: async (): Promise<Enrollment[]> => {
      if (!studentId) return [];

      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          id, 
          status, 
          start_date,
          completion_percentage,
          courses:course_id (
            name
          )
        `)
        .eq('student_id', studentId);

      if (error) {
        toast({
          title: 'Error fetching enrollments',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }

      return (data || []).map(item => ({
        id: item.id,
        courseName: item.courses?.name || 'Unknown Course',
        status: item.status || 'unknown',
        startDate: item.start_date,
        completionPercentage: item.completion_percentage || 0
      }));
    },
    enabled: !!studentId
  });

  return {
    enrollments: query.data || [],
    isLoading: query.isLoading,
    error: query.error
  };
};
