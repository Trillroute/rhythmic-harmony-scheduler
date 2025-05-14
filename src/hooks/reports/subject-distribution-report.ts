
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ReportPeriod, SubjectDistributionData } from "./types";
import { assertAttendanceStatusArray } from "@/lib/type-utils";

// Fetch subject distribution data for reports
export const useSubjectDistributionReport = (filters?: ReportPeriod) => {
  const fetchSubjectDistribution = async (): Promise<SubjectDistributionData> => {
    let query = supabase
      .from('sessions')
      .select('subject, session_type');
    
    // Apply date range filters if provided
    if (filters?.startDate) {
      query = query.gte('date_time', filters.startDate.toISOString());
    }
    
    if (filters?.endDate) {
      query = query.lte('date_time', filters.endDate.toISOString());
    }
    
    // Apply status filter if provided
    if (filters?.status && filters.status.length > 0) {
      // Cast array values to string for database query
      const statusStrings = filters.status.map(s => s.toString());
      query = query.in('status', statusStrings);
    }
      
    const { data, error } = await query;
      
    if (error) throw error;
    
    const subjectCounts: Record<string, { total: number, solo: number, duo: number, focus: number }> = {};
    
    data.forEach(session => {
      if (!subjectCounts[session.subject]) {
        subjectCounts[session.subject] = { total: 0, solo: 0, duo: 0, focus: 0 };
      }
      
      subjectCounts[session.subject].total += 1;
      
      // Count by session type
      if (session.session_type === 'Solo') {
        subjectCounts[session.subject].solo += 1;
      } else if (session.session_type === 'Duo') {
        subjectCounts[session.subject].duo += 1;
      } else if (session.session_type === 'Focus') {
        subjectCounts[session.subject].focus += 1;
      }
    });
    
    const chartData = Object.entries(subjectCounts).map(([subject, counts]) => ({
      subject,
      sessions: counts.total,
      solo: counts.solo,
      duo: counts.duo,
      focus: counts.focus
    }));
    
    return {
      chartData
    };
  };
  
  return useQuery({
    queryKey: ['reports', 'subjects', filters],
    queryFn: fetchSubjectDistribution,
  });
};
