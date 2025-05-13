
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { StudentProgress } from "@/lib/models";

export interface ProgressWithRelations extends StudentProgress {
  enrollment?: {
    id: string;
    student_id: string;
    course_id: string;
    student_name?: string;
    course_name?: string;
  };
  updatedBy?: {
    id: string;
    name: string;
  };
}

export const useProgress = (enrollmentId?: string) => {
  const queryClient = useQueryClient();

  // Fetch progress entries for a specific enrollment
  const { data: progress, isLoading, error } = useQuery({
    queryKey: ['student-progress', enrollmentId],
    queryFn: async () => {
      if (!enrollmentId) return null;
      
      const { data, error } = await supabase
        .from('student_progress')
        .select(`
          *,
          enrollments!student_progress_enrollment_id_fkey (
            id,
            student_id,
            course_id,
            students (
              profiles (
                name
              )
            ),
            courses (
              name
            )
          ),
          profiles!student_progress_last_updated_by_fkey (
            id,
            name
          )
        `)
        .eq('enrollment_id', enrollmentId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (!data || data.length === 0) return null;
      
      // Parse the progress entry with relations
      return {
        id: data[0].id,
        enrollment_id: data[0].enrollment_id,
        module_number: data[0].module_number,
        session_number: data[0].session_number,
        completion_percentage: data[0].completion_percentage,
        teacher_notes: data[0].teacher_notes,
        student_notes: data[0].student_notes,
        last_updated_by: data[0].last_updated_by,
        created_at: new Date(data[0].created_at),
        updated_at: new Date(data[0].updated_at),
        enrollment: data[0].enrollments ? {
          id: data[0].enrollments.id,
          student_id: data[0].enrollments.student_id,
          course_id: data[0].enrollments.course_id,
          student_name: data[0].enrollments.students?.profiles?.name,
          course_name: data[0].enrollments.courses?.name
        } : undefined,
        updatedBy: data[0].profiles ? {
          id: data[0].profiles.id,
          name: data[0].profiles.name
        } : undefined
      } as ProgressWithRelations;
    },
    enabled: !!enrollmentId
  });

  // Update student progress
  const updateProgress = useMutation({
    mutationFn: async (progressData: Partial<StudentProgress> & { id: string }) => {
      const { id, ...updateFields } = progressData;
      
      const { error } = await supabase
        .from('student_progress')
        .update({ ...updateFields, updated_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
      
      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-progress'] });
      toast.success("Progress updated successfully");
    },
    onError: (error: any) => {
      toast.error(`Error updating progress: ${error.message}`);
    }
  });

  // Create new progress entry
  const createProgress = useMutation({
    mutationFn: async (progressData: Partial<StudentProgress>) => {
      const { data, error } = await supabase
        .from('student_progress')
        .insert([progressData])
        .select('id')
        .single();
      
      if (error) throw error;
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-progress'] });
      toast.success("Progress entry created successfully");
    },
    onError: (error: any) => {
      toast.error(`Error creating progress entry: ${error.message}`);
    }
  });

  return {
    progress,
    isLoading,
    error,
    updateProgress: updateProgress.mutateAsync,
    createProgress: createProgress.mutateAsync,
    isPendingUpdate: updateProgress.isPending,
    isPendingCreate: createProgress.isPending
  };
};

// Hook to get progress for all enrollments of a student
export const useStudentProgress = (studentId?: string) => {
  return useQuery({
    queryKey: ['student-progress-all', studentId],
    queryFn: async () => {
      if (!studentId) return [];
      
      // First get all enrollments for this student
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from('enrollments')
        .select('id, course_id, courses(name)')
        .eq('student_id', studentId);
      
      if (enrollmentsError) throw enrollmentsError;
      
      if (!enrollments || enrollments.length === 0) return [];
      
      // Then get progress for each enrollment
      const progressPromises = enrollments.map(async (enrollment) => {
        const { data, error } = await supabase
          .from('student_progress')
          .select('*')
          .eq('enrollment_id', enrollment.id)
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (error) throw error;
        
        return {
          enrollmentId: enrollment.id,
          courseId: enrollment.course_id,
          courseName: enrollment.courses?.name,
          progress: data && data.length > 0 ? data[0].completion_percentage : 0,
          lastUpdated: data && data.length > 0 ? new Date(data[0].updated_at) : null
        };
      });
      
      return Promise.all(progressPromises);
    },
    enabled: !!studentId
  });
};
