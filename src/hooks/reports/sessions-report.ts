
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ReportPeriod, SessionsReportData } from "./types";
import { assertAttendanceStatusArray } from "@/lib/type-utils";

// Fetch sessions data for reports
export const useSessionsReport = (filters?: ReportPeriod) => {
  const fetchSessionsData = async (): Promise<SessionsReportData> => {
    let query = supabase
      .from('sessions')
      .select('id, subject');
    
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
    
    // Count by subject
    const subjectCounts: Record<string, number> = {};
    
    data.forEach(session => {
      if (!subjectCounts[session.subject]) {
        subjectCounts[session.subject] = 0;
      }
      
      subjectCounts[session.subject] += 1;
    });
    
    const chartData = Object.entries(subjectCounts).map(([subject, count]) => ({
      subject,
      count
    }));
    
    return {
      totalSessions: data.length,
      chartData
    };
  };
  
  return useQuery({
    queryKey: ['reports', 'sessions', filters],
    queryFn: fetchSessionsData,
  });
};
