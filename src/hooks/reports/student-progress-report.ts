
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ReportPeriod, StudentProgressData } from "./types";

// Fetch student progress data for reports
export const useStudentProgressReport = (filters?: ReportPeriod) => {
  const fetchStudentProgressData = async (): Promise<StudentProgressData> => {
    // Get count of active students
    const { count: activeStudents, error: countError } = await supabase
      .from('session_packs')
      .select('student_id', { count: 'exact', head: true })
      .eq('is_active', true);
    
    if (countError) throw countError;
    
    // Get progress distribution (this is a placeholder - adjust based on your data model)
    // In a real implementation, you'd query student_progress or a similar table
    const chartData = [
      { name: 'Starting', value: 20 },
      { name: 'In Progress', value: 45 },
      { name: 'Advanced', value: 25 },
      { name: 'Completed', value: 10 }
    ];
    
    return {
      activeStudents: activeStudents || 0,
      chartData
    };
  };
  
  return useQuery({
    queryKey: ['reports', 'studentProgress', filters],
    queryFn: fetchStudentProgressData,
  });
};
