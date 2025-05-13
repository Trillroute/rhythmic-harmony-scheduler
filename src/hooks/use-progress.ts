
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../integrations/supabase/client";
import { toast } from "sonner";

interface ProgressEntry {
  id: string;
  enrollmentId: string;
  moduleNumber?: number;
  sessionNumber?: number;
  completionPercentage: number;
  teacherNotes?: string;
  studentNotes?: string;
  lastUpdatedBy: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateProgressProps {
  enrollment_id: string;
  module_number?: number;
  session_number?: number;
  completion_percentage: number;
  teacher_notes?: string;
  student_notes?: string;
}

interface UpdateProgressProps {
  id: string;
  completion_percentage?: number;
  teacher_notes?: string;
  student_notes?: string;
}

interface ProgressDataPoint {
  date: string;
  value: number;
}

interface ChartData {
  id: string;
  data: ProgressDataPoint[];
}

export const useStudentProgress = (enrollmentId?: string) => {
  const queryKey = ["student_progress", enrollmentId];
  
  const fetchProgress = async (): Promise<ProgressEntry[]> => {
    let query = supabase.from("student_progress").select("*");
    
    if (enrollmentId) {
      query = query.eq("enrollment_id", enrollmentId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    // Transform data to match our interface
    return data.map(progress => ({
      id: progress.id,
      enrollmentId: progress.enrollment_id,
      moduleNumber: progress.module_number,
      sessionNumber: progress.session_number,
      completionPercentage: progress.completion_percentage,
      teacherNotes: progress.teacher_notes,
      studentNotes: progress.student_notes,
      lastUpdatedBy: progress.last_updated_by,
      createdAt: progress.created_at,
      updatedAt: progress.updated_at
    }));
  };
  
  return useQuery({
    queryKey,
    queryFn: fetchProgress,
    enabled: !!enrollmentId
  });
};

export const useCreateProgress = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (progressData: CreateProgressProps) => {
      const { data, error } = await supabase
        .from("student_progress")
        .insert([{
          ...progressData,
          last_updated_by: (await supabase.auth.getUser()).data.user?.id
        }])
        .select();
        
      if (error) {
        throw error;
      }
      
      return data[0];
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["student_progress", data.enrollment_id] });
      toast.success("Progress entry created successfully");
    },
    onError: (error) => {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Error creating progress entry: ${errorMsg}`);
    }
  });
};

export const useUpdateProgress = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updateData }: UpdateProgressProps) => {
      const { data, error } = await supabase
        .from("student_progress")
        .update({
          ...updateData,
          last_updated_by: (await supabase.auth.getUser()).data.user?.id,
          updated_at: new Date().toISOString()
        })
        .eq("id", id)
        .select();
        
      if (error) {
        throw error;
      }
      
      return data[0];
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["student_progress", data.enrollment_id] });
      toast.success("Progress updated successfully");
    },
    onError: (error) => {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Error updating progress: ${errorMsg}`);
    }
  });
};

// Hook to get progress trends for charts
export const useProgressTrends = (enrollmentId?: string) => {
  const queryKey = ["progress_trends", enrollmentId];
  
  const fetchTrends = async (): Promise<ChartData> => {
    if (!enrollmentId) {
      return { id: 'progress', data: [] };
    }
    
    const { data, error } = await supabase
      .from("student_progress")
      .select("completion_percentage, created_at")
      .eq("enrollment_id", enrollmentId)
      .order('created_at', { ascending: true });
      
    if (error) {
      throw error;
    }
    
    // Format data for charts
    const progressData: ProgressDataPoint[] = data.map(entry => ({
      date: new Date(entry.created_at).toLocaleDateString(),
      value: entry.completion_percentage
    }));
    
    return {
      id: 'progress',
      data: progressData
    };
  };
  
  return useQuery({
    queryKey,
    queryFn: fetchTrends,
    enabled: !!enrollmentId
  });
};
