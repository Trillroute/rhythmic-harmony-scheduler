
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SubjectDistributionData } from "./types";

/**
 * Custom hook to fetch subject distribution data
 */
export const useSubjectDistributionReport = () => {
  return useQuery({
    queryKey: ['reports', 'subjectDistribution'],
    queryFn: async (): Promise<SubjectDistributionData> => {
      try {
        // Fetch subjects data from sessions
        const { data: sessionsData, error: sessionsError } = await supabase
          .from('sessions')
          .select('subject, id')
          .order('subject');

        if (sessionsError) throw new Error(sessionsError.message);

        // Fetch subjects data from students preferences
        const { data: studentsData, error: studentsError } = await supabase
          .from('students')
          .select('preferred_subjects');

        if (studentsError) throw new Error(studentsError.message);

        // Process sessions data
        const sessionsBySubject = sessionsData.reduce((acc: Record<string, number>, session: any) => {
          const subject = session.subject;
          acc[subject] = (acc[subject] || 0) + 1;
          return acc;
        }, {});

        // Process students data
        const studentsBySubject = studentsData.reduce((acc: Record<string, number>, student: any) => {
          if (student.preferred_subjects && Array.isArray(student.preferred_subjects)) {
            student.preferred_subjects.forEach((subject: string) => {
              acc[subject] = (acc[subject] || 0) + 1;
            });
          }
          return acc;
        }, {});

        // Combine data
        const allSubjects = [...new Set([...Object.keys(sessionsBySubject), ...Object.keys(studentsBySubject)])];

        const subjectData = allSubjects.map(subject => {
          return {
            subject: subject,
            count: sessionsBySubject[subject] || 0,
            name: subject, // Also include name to match usage in utils
            value: sessionsBySubject[subject] || 0 // Also include value to match usage in utils
          };
        });

        return subjectData;
      } catch (error) {
        console.error("Error fetching subject distribution data:", error);
        throw error;
      }
    }
  });
};
