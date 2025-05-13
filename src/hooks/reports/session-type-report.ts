
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ReportPeriod, SessionTypeData } from "./types";

// Fetch session type distribution data for reports
export const useSessionTypeReport = (filters?: ReportPeriod) => {
  const fetchSessionTypeDistribution = async (): Promise<SessionTypeData> => {
    let query = supabase
      .from('sessions')
      .select('session_type');
    
    // Apply date range filters if provided
    if (filters?.startDate) {
      query = query.gte('date_time', filters.startDate.toISOString());
    }
    
    if (filters?.endDate) {
      query = query.lte('date_time', filters.endDate.toISOString());
    }
    
    // Apply subject filter if provided
    if (filters?.subjects && filters.subjects.length > 0) {
      // Cast to string array for the query
      query = query.in('subject', filters.subjects.map(s => s as string) as string[]);
    }
    
    // Apply status filter if provided
    if (filters?.status && filters.status.length > 0) {
      // Cast to string array for the query
      query = query.in('status', filters.status.map(s => s as string) as string[]);
    }
      
    const { data, error } = await query;
      
    if (error) throw error;
    
    const typeCounts: Record<string, number> = {
      'Solo': 0,
      'Duo': 0,
      'Focus': 0
    };
    
    data.forEach(session => {
      typeCounts[session.session_type] += 1;
    });
    
    const chartData = Object.entries(typeCounts).map(([name, value]) => ({
      name,
      value
    }));
    
    return {
      chartData
    };
  };
  
  return useQuery({
    queryKey: ['reports', 'sessionTypes', filters],
    queryFn: fetchSessionTypeDistribution,
  });
};
