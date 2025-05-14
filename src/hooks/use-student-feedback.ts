
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

type StudentFeedback = {
  id: string;
  teacherId: string;
  teacherName: string;
  sessionId?: string;
  sessionSubject?: string;
  feedbackText: string;
  rating?: number;
  createdAt: string;
};

export const useStudentFeedback = (studentId: string | undefined) => {
  return useQuery({
    queryKey: ['feedback', studentId],
    queryFn: async () => {
      if (!studentId) return [];

      const { data, error } = await supabase
        .from('student_feedback')
        .select(`
          id,
          feedback_text,
          rating,
          created_at,
          session_id,
          teacher_id,
          teachers:teachers (
            profiles:profiles (
              name
            )
          ),
          sessions:sessions (
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

      return data.map((item: any) => ({
        id: item.id,
        teacherId: item.teacher_id,
        teacherName: item.teachers?.profiles?.name || 'Unknown Teacher',
        sessionId: item.session_id,
        sessionSubject: item.sessions?.subject,
        feedbackText: item.feedback_text,
        rating: item.rating,
        createdAt: item.created_at,
      })) as StudentFeedback[];
    },
    enabled: !!studentId,
  });
};
