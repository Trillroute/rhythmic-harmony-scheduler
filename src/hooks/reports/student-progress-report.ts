
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { StudentProgressData } from './types';

export const useStudentProgressReport = () => {
  return useQuery({
    queryKey: ['reports', 'student-progress'],
    queryFn: async (): Promise<StudentProgressData> => {
      try {
        // Get student enrollments with their progress
        const { data: enrollments, error: enrollmentsError } = await supabase
          .from('enrollments')
          .select(`
            id, 
            student_id, 
            course_id, 
            start_date, 
            end_date, 
            completion_percentage,
            students:student_id (name),
            courses:course_id (name)
          `)
          .order('completion_percentage', { ascending: false })
          .limit(20);
        
        if (enrollmentsError) throw enrollmentsError;
        
        // Transform the data to the required format
        const progressData = enrollments.map(enrollment => {
          // Extract student name from the join result
          // Handle potential nested structure differences
          let studentName = "Unknown";
          if (enrollment.students && typeof enrollment.students === 'object') {
            studentName = enrollment.students.name || "Unknown";
          }
          
          // Extract course name from the join result
          let courseName = "Unknown";
          if (enrollment.courses && typeof enrollment.courses === 'object') {
            courseName = enrollment.courses.name || "Unknown";
          }
          
          return {
            enrollmentId: enrollment.id,
            studentId: enrollment.student_id,
            studentName: studentName,
            courseId: enrollment.course_id,
            courseName: courseName, 
            startDate: enrollment.start_date,
            endDate: enrollment.end_date,
            completionPercentage: enrollment.completion_percentage
          };
        });
        
        return progressData;
      } catch (error) {
        console.error('Error fetching student progress data:', error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
