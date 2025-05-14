
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface StudentFeedback {
  id: string;
  teacherName?: string;
  sessionSubject?: string;
  rating?: number;
  feedbackText: string;
  createdAt: string | Date;
}

export const useStudentFeedback = (studentId: string | undefined) => {
  const query = useQuery({
    queryKey: ['student-feedback', studentId],
    queryFn: async (): Promise<StudentFeedback[]> => {
      if (!studentId) return [];

      const { data, error } = await supabase
        .from('student_feedback')
        .select(`
          id, 
          feedback_text, 
          rating, 
          created_at,
          teachers:teacher_id (
            profiles:id (
              name
            )
          ),
          sessions:session_id (
            subject
          )
        `)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: 'Error fetching feedback',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }

      return (data || []).map(item => ({
        id: item.id,
        teacherName: item.teachers?.profiles?.name || 'Unknown Teacher',
        sessionSubject: item.sessions?.subject,
        rating: item.rating,
        feedbackText: item.feedback_text,
        createdAt: item.created_at
      }));
    },
    enabled: !!studentId
  });

  return {
    feedback: query.data || [],
    isLoading: query.isLoading,
    error: query.error
  };
};
