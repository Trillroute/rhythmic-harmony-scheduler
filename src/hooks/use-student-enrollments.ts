
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

type Enrollment = {
  id: string;
  courseName: string;
  startDate: string;
  endDate?: string;
  status: string;
  completionPercentage: number;
};

export const useStudentEnrollments = (studentId: string | undefined) => {
  return useQuery({
    queryKey: ['enrollments', studentId],
    queryFn: async () => {
      if (!studentId) return [];

      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          id,
          status,
          start_date,
          end_date,
          completion_percentage,
          courses (
            id,
            name,
            instrument,
            description
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

      return data.map((item: any) => ({
        id: item.id,
        courseName: item.courses?.name || 'Unknown Course',
        courseInstrument: item.courses?.instrument,
        startDate: item.start_date,
        endDate: item.end_date,
        status: item.status,
        completionPercentage: item.completion_percentage || 0,
      })) as Enrollment[];
    },
    enabled: !!studentId,
  });
};
