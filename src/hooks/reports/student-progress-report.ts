
import { useState } from "react";
import { StudentProgressData, StudentProgressPoint, ReportPeriod } from "./types";
import { supabase } from "@/integrations/supabase/client";

export function useStudentProgressReport() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<StudentProgressData>({
    activeStudents: 0,
    chartData: [],
    data: []
  });

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get active student count
      const { count: activeCount, error: countError } = await supabase
        .from("enrollments")
        .select("*", { count: 'exact', head: true })
        .eq('status', 'active');
      
      if (countError) throw new Error(countError.message);
      
      // Get student progress data
      const { data: progressData, error: progressError } = await supabase
        .from("student_progress")
        .select(`
          id,
          completion_percentage,
          enrollment_id,
          enrollments (
            id,
            student_id, 
            course_id,
            profiles:students!enrollments_student_id_fkey(name),
            courses(name, instrument)
          )
        `)
        .order('completion_percentage', { ascending: false })
        .limit(10);
      
      if (progressError) throw new Error(progressError.message);
      
      // Process data for the report
      const processedData: StudentProgressPoint[] = progressData.map(record => {
        // Safely extract the student name
        let studentName = "Unknown Student";
        if (record.enrollments?.profiles && typeof record.enrollments.profiles === 'object') {
          studentName = (record.enrollments.profiles as any).name || studentName;
        }
        
        // Safely extract course name and instrument
        let courseName = "Unknown Course";
        let instrument = "Unknown Instrument";
        
        if (record.enrollments?.courses) {
          courseName = record.enrollments.courses.name || courseName;
          instrument = record.enrollments.courses.instrument || instrument;
        }
        
        return {
          id: record.id,
          studentName,
          courseName,
          instrument,
          completionPercentage: record.completion_percentage
        };
      });
      
      // Set the processed data
      setData({
        activeStudents: activeCount || 0,
        chartData: processedData,
        data: processedData
      });
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching student progress data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    data,
    fetchData,
  };
}
