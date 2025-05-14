
import { useState } from "react";
import { StudentProgressData, ReportPeriod } from "./types";
import { supabase } from "@/integrations/supabase/client";

export function useStudentProgressReport() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<StudentProgressData>([]);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get student progress data
      const { data: progressData, error: progressError } = await supabase
        .from("student_progress")
        .select(`
          id,
          completion_percentage,
          enrollments (
            id,
            student_id, 
            course_id,
            profiles (name),
            courses (name, instrument)
          )
        `)
        .order('completion_percentage', { ascending: false })
        .limit(10);
      
      if (progressError) throw new Error(progressError.message);
      
      // Process data for the report
      const processedData = progressData.map(record => ({
        id: record.id,
        studentName: record.enrollments?.profiles?.name || 'Unknown Student',
        courseName: record.enrollments?.courses?.name || 'Unknown Course',
        instrument: record.enrollments?.courses?.instrument || 'Unknown Instrument',
        completionPercentage: record.completion_percentage
      }));
      
      setData(processedData);
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
