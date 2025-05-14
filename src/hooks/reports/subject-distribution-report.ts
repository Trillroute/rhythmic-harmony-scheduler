
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SubjectDistributionData } from './types';
import { assertSubjectType } from '@/lib/type-utils';

export const useSubjectDistributionReport = () => {
  return useQuery({
    queryKey: ['reports', 'subjects'],
    queryFn: async (): Promise<SubjectDistributionData> => {
      try {
        // Get count of students by subject preference
        const { data: studentsData, error: studentsError } = await supabase
          .from('students')
          .select('preferred_subjects');
        
        if (studentsError) throw studentsError;
        
        // Get count of sessions by subject
        const { data: sessionsData, error: sessionsError } = await supabase
          .from('sessions')
          .select('subject');
          
        if (sessionsError) throw sessionsError;
        
        // Manually group the data since .group() is not available
        const subjectCounts: {[key: string]: number} = {};
        const subjectSessionCounts: {[key: string]: number} = {};
        
        // Process student subject preferences
        studentsData.forEach(student => {
          if (Array.isArray(student.preferred_subjects)) {
            student.preferred_subjects.forEach(subject => {
              const safeSubject = assertSubjectType(subject);
              subjectCounts[safeSubject] = (subjectCounts[safeSubject] || 0) + 1;
            });
          }
        });
        
        // Process session subjects
        sessionsData.forEach(session => {
          if (session.subject) {
            const safeSubject = assertSubjectType(session.subject);
            subjectSessionCounts[safeSubject] = (subjectSessionCounts[safeSubject] || 0) + 1;
          }
        });
        
        // Transform to required output format
        const result: SubjectDistributionData = Object.keys(subjectCounts).map(subject => ({
          subject,
          studentCount: subjectCounts[subject] || 0,
          sessionCount: subjectSessionCounts[subject] || 0
        }));
        
        return result;
      } catch (error) {
        console.error('Error fetching subject distribution data:', error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
