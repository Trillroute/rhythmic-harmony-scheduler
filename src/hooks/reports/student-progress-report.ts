
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StudentProgressData, StudentProgressItem } from "./types";

/**
 * Custom hook to fetch student progress data
 */
export const useStudentProgressReport = () => {
  return useQuery({
    queryKey: ['reports', 'studentProgress'],
    queryFn: async (): Promise<StudentProgressData> => {
      try {
        // Fetch enrollments with student and course details
        const { data: enrollments, error: enrollmentError } = await supabase
          .from('enrollments')
          .select(`
            id,
            student_id,
            course_id,
            start_date,
            end_date,
            completion_percentage,
            students:student_id(
              profiles(name)
            ),
            courses:course_id(
              name,
              instrument
            )
          `)
          .order('start_date', { ascending: false });

        if (enrollmentError) throw new Error(enrollmentError.message);

        // Transform data to expected format
        const students: StudentProgressItem[] = enrollments?.map(enrollment => {
          // Safely access student name
          const studentName = enrollment.students && 
                             enrollment.students.profiles && 
                             Array.isArray(enrollment.students.profiles) && 
                             enrollment.students.profiles.length > 0 
                             ? enrollment.students.profiles[0]?.name 
                             : "Unknown";

          return {
            studentId: enrollment.student_id,
            studentName,
            completionPercentage: enrollment.completion_percentage,
            student: {
              id: enrollment.student_id,
              name: studentName
            },
            progress: {
              id: enrollment.id,
              courseName: enrollment.courses?.name || "Unknown Course",
              instrument: enrollment.courses?.instrument || "Unknown",
              completionPercentage: enrollment.completion_percentage
            }
          };
        }) || [];

        // Calculate average completion percentage
        const averageCompletion = students.length > 0
          ? students.reduce((sum, student) => sum + student.completionPercentage, 0) / students.length
          : 0;

        return {
          students,
          averageCompletion: Math.round(averageCompletion)
        };
      } catch (error) {
        console.error("Error fetching student progress data:", error);
        throw error;
      }
    }
  });
};
