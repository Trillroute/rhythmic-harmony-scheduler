
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

        // Process sessions data
        const sessionsBySubject = sessionsData.reduce((acc: Record<string, number>, session: any) => {
          const subject = session.subject;
          acc[subject] = (acc[subject] || 0) + 1;
          return acc;
        }, {});

        // Convert to array format
        const result: SubjectDistributionData = {
          Guitar: sessionsBySubject['Guitar'] || 0,
          Piano: sessionsBySubject['Piano'] || 0,
          Drums: sessionsBySubject['Drums'] || 0,
          Ukulele: sessionsBySubject['Ukulele'] || 0,
          Vocal: sessionsBySubject['Vocal'] || 0,
          chartData: {
            labels: Object.keys(sessionsBySubject),
            data: Object.values(sessionsBySubject)
          }
        };
        
        // Add array-like properties for backward compatibility
        const subjectItems = Object.keys(sessionsBySubject).map((subject, index) => {
          const count = sessionsBySubject[subject];
          const item = {
            subject,
            count,
            name: subject,
            value: count
          };
          result[index] = item;
          return item;
        });
        
        result.length = subjectItems.length;
        
        return result;
      } catch (error) {
        console.error("Error fetching subject distribution data:", error);
        throw error;
      }
    }
  });
};
