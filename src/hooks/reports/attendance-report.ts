
import { useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { safeConvertStatus, safeConvertSubjects } from "./utils";
import { ReportPeriod, AttendanceData } from "./types";
import { format } from "date-fns";

export function useAttendanceReport() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AttendanceData | null>(null);

  const fetchAttendanceData = useCallback(async (period: ReportPeriod) => {
    setIsLoading(true);
    setError(null);

    try {
      // Start with a base query for sessions
      let query = supabase
        .from("sessions")
        .select("id, date_time, status");
      
      // Apply date filters
      if (period.startDate) {
        query = query.gte('date_time', period.startDate.toISOString());
      }
      
      if (period.endDate) {
        query = query.lte('date_time', period.endDate.toISOString());
      }
      
      // Apply subject filter if specified
      if (period.subjects && period.subjects.length > 0) {
        query = query.in('subject', safeConvertSubjects(period.subjects as string[]));
      }
      
      // Apply status filter if specified
      if (period.status && period.status.length > 0) {
        query = query.in('status', safeConvertStatus(period.status as string[]));
      }

      const { data: sessions, error } = await query;

      if (error) throw error;

      // Process the data
      const totalSessions = sessions.length;
      const presentSessions = sessions.filter(s => s.status === 'Present').length;
      const attendanceRate = totalSessions > 0 
        ? (presentSessions / totalSessions) * 100 
        : 0;

      // Group sessions by date for chart data
      const sessionsByDate = sessions.reduce((acc: Record<string, any>, session) => {
        const date = format(new Date(session.date_time), 'yyyy-MM-dd');
        
        if (!acc[date]) {
          acc[date] = {
            total: 0,
            present: 0
          };
        }
        
        acc[date].total += 1;
        if (session.status === 'Present') {
          acc[date].present += 1;
        }
        
        return acc;
      }, {});

      // Convert to chart data format
      const chartData = Object.keys(sessionsByDate).map(date => ({
        date,
        total: sessionsByDate[date].total,
        present: sessionsByDate[date].present,
        rate: sessionsByDate[date].total > 0 
          ? (sessionsByDate[date].present / sessionsByDate[date].total) * 100 
          : 0
      })).sort((a, b) => a.date.localeCompare(b.date));

      setData({
        attendanceRate,
        chartData
      });
      
    } catch (err: any) {
      console.error("Error fetching attendance data:", err);
      setError(err.message || "An error occurred while fetching attendance data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    data,
    fetchAttendanceData
  };
}
