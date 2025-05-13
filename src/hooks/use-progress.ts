
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { StudentProgress } from '@/lib/models';
import { useAuth } from '@/contexts/AuthContext';

export const useProgress = (enrollmentId: string | undefined) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: progress, isLoading, error } = useQuery({
    queryKey: ['progress', enrollmentId],
    queryFn: async () => {
      if (!enrollmentId) return null;
      
      const { data, error } = await supabase
        .from('student_progress')
        .select(`
          *,
          last_updated_by:profiles!student_progress_last_updated_by_fkey (
            name
          )
        `)
        .eq('enrollment_id', enrollmentId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // No data found
          return null;
        }
        throw error;
      }
      
      return {
        id: data.id,
        enrollment_id: data.enrollment_id,
        module_number: data.module_number,
        session_number: data.session_number,
        completion_percentage: data.completion_percentage,
        teacher_notes: data.teacher_notes,
        student_notes: data.student_notes,
        last_updated_by: data.last_updated_by_fkey,
        last_updated_by_name: data.last_updated_by?.name,
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at)
      } as StudentProgress & { last_updated_by_name: string };
    },
    enabled: !!enrollmentId
  });

  const updateProgress = useMutation({
    mutationFn: async (progressData: Partial<StudentProgress> & { enrollment_id: string }) => {
      // Check if progress entry already exists
      const { data: existingProgress } = await supabase
        .from('student_progress')
        .select('id')
        .eq('enrollment_id', progressData.enrollment_id)
        .maybeSingle();
      
      if (existingProgress) {
        // Update existing progress
        const { data, error } = await supabase
          .from('student_progress')
          .update({
            ...progressData,
            last_updated_by: user?.id,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingProgress.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        // Create new progress entry
        const { data, error } = await supabase
          .from('student_progress')
          .insert([{
            ...progressData,
            last_updated_by: user?.id,
            completion_percentage: progressData.completion_percentage || 0
          }])
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['progress', variables.enrollment_id] });
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      toast.success('Progress updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to update progress: ${error.message}`);
    }
  });

  return {
    progress,
    isLoading,
    error,
    updateProgress: updateProgress.mutateAsync,
    isPendingUpdate: updateProgress.isPending
  };
};

export const useStudentProgressList = (studentId: string | undefined) => {
  const { data: progressItems, isLoading, error } = useQuery({
    queryKey: ['progress-list', studentId],
    queryFn: async () => {
      if (!studentId) return [];
      
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          id,
          course_id,
          start_date,
          status,
          courses (
            name,
            instrument
          ),
          student_progress (
            completion_percentage,
            module_number,
            session_number,
            updated_at
          )
        `)
        .eq('student_id', studentId)
        .order('start_date', { ascending: false });
      
      if (error) throw error;
      
      return data.map((item: any) => ({
        enrollmentId: item.id,
        courseId: item.course_id,
        courseName: item.courses?.name,
        instrument: item.courses?.instrument,
        startDate: new Date(item.start_date),
        status: item.status,
        progress: item.student_progress?.[0]?.completion_percentage || 0,
        moduleNumber: item.student_progress?.[0]?.module_number,
        sessionNumber: item.student_progress?.[0]?.session_number,
        lastUpdated: item.student_progress?.[0]?.updated_at 
          ? new Date(item.student_progress[0].updated_at)
          : null
      }));
    },
    enabled: !!studentId
  });

  return {
    progressItems,
    isLoading,
    error
  };
};
