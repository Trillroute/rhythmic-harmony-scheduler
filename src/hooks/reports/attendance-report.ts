
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ReportPeriod, AttendanceData } from "./types";
import { assertAttendanceStatusArray, assertSubjectTypeArray } from "@/lib/type-utils";

// Fetch attendance data for reports
export const useAttendanceReport = (filters?: ReportPeriod) => {
  const fetchAttendanceData = async (): Promise<AttendanceData> => {
    let query = supabase
      .from('sessions')
      .select('status, date_time');
    
    // Apply date range filters if provided
    if (filters?.startDate) {
      query = query.gte('date_time', filters.startDate.toISOString());
    }
    
    if (filters?.endDate) {
      query = query.lte('date_time', filters.endDate.toISOString());
    }
    
    // Apply subject filter if provided
    if (filters?.subjects && filters.subjects.length > 0) {
      // Use the assertion utility to ensure proper types
      const subjectArray = assertSubjectTypeArray(filters.subjects);
      // Convert to string array for query
      const subjectStrings = subjectArray.map(s => s.toString());
      query = query.in('subject', subjectStrings);
    }
    
    // Apply status filter if provided
    if (filters?.status && filters.status.length > 0) {
      // Use the assertion utility to ensure proper types
      const statusArray = assertAttendanceStatusArray(filters.status);
      // Convert to string array for query
      const statusStrings = statusArray.map(s => s.toString());
      query = query.in('status', statusStrings);
    }
      
    const { data, error } = await query;
      
    if (error) throw error;
    
    // Count by status
    const statusCounts: Record<string, number> = {
      'Present': 0,
      'Absent': 0,
      'Scheduled': 0,
      'Cancelled by Student': 0,
      'Cancelled by Teacher': 0,
      'Cancelled by School': 0,
      'No Show': 0
    };
    
    // Count sessions by day
    const sessionsByDay: Record<string, number> = {};
    
    data.forEach(session => {
      statusCounts[session.status] += 1;
      
      // Extract day for daily distribution
      const day = session.date_time.substring(0, 10);
      if (!sessionsByDay[day]) {
        sessionsByDay[day] = 0;
      }
      
      sessionsByDay[day] += 1;
    });
    
    // Transform for chart data
    const statusData = Object.entries(statusCounts).map(([status, count]) => ({
      name: status,
      value: count
    }));
    
    const dailyData = Object.entries(sessionsByDay)
      .map(([date, count]) => ({
        date,
        sessions: count
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
    
    return {
      totalSessions: data.length,
      statusData,
      dailyData
    };
  };
  
  return useQuery({
    queryKey: ['reports', 'attendance', filters],
    queryFn: fetchAttendanceData,
  });
};
