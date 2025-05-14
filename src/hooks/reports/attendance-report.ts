
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { AttendanceData, ReportPeriod } from "./types";
import { AttendanceStatus, SubjectType } from "@/lib/types";
import { assertAttendanceStatusArray, assertSubjectTypeArray } from "@/lib/type-utils";

// Fetch attendance data for reports
export const useAttendanceReport = (period: 'week' | 'month' | 'quarter' = 'month', filters?: ReportPeriod) => {
  const fetchAttendanceData = async (): Promise<AttendanceData> => {
    const endDate = filters?.endDate || new Date();
    let startDate = filters?.startDate;
    
    if (!startDate) {
      switch (period) {
        case 'week':
          startDate = new Date(endDate);
          startDate.setDate(endDate.getDate() - 7);
          break;
        case 'quarter':
          startDate = subMonths(endDate, 3);
          break;
        case 'month':
        default:
          startDate = startOfMonth(endDate);
          startDate = subMonths(startDate, 1); // Get last month data too
          break;
      }
    }
    
    let query = supabase
      .from('sessions')
      .select('date_time, status')
      .gte('date_time', startDate.toISOString())
      .lte('date_time', endDate.toISOString());
    
    // Apply subject filter if provided  
    if (filters?.subjects && filters.subjects.length > 0) {
      // Convert to string array for query and assert types afterward
      const subjectStrings = filters.subjects.map(s => s.toString());
      query = query.in('subject', subjectStrings);
    }
    
    // Apply status filter if provided
    if (filters?.status && filters.status.length > 0) {
      // Convert to string array for query and assert types afterward
      const statusStrings = filters.status.map(s => s.toString());
      query = query.in('status', statusStrings);
    }
      
    const { data, error } = await query;
      
    if (error) throw error;
    
    // Group by date
    const groupedByDate: Record<string, { total: number, present: number }> = {};
    
    data.forEach(session => {
      const dateKey = format(new Date(session.date_time), 'yyyy-MM-dd');
      
      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = { total: 0, present: 0 };
      }
      
      groupedByDate[dateKey].total += 1;
      if (session.status === 'Present') {
        groupedByDate[dateKey].present += 1;
      }
    });
    
    // Calculate overall attendance rate
    let totalSessions = 0;
    let totalPresent = 0;
    
    Object.values(groupedByDate).forEach(val => {
      totalSessions += val.total;
      totalPresent += val.present;
    });
    
    const attendanceRate = totalSessions > 0 ? Math.round((totalPresent / totalSessions) * 100) : 0;
    
    // Format for chart
    const chartData = Object.entries(groupedByDate).map(([date, stats]) => ({
      date: format(new Date(date), 'MMM dd'),
      total: stats.total,
      present: stats.present,
      rate: stats.total > 0 ? (stats.present / stats.total) * 100 : 0
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return {
      attendanceRate,
      chartData
    };
  };
  
  return useQuery({
    queryKey: ['reports', 'attendance', period, filters],
    queryFn: fetchAttendanceData,
  });
};
