
import { useState } from "react";
import { SessionsReportData, ReportPeriod } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { getDateRangeFromPeriod } from "./date-utils";
import { assertStringArray } from "@/lib/type-utils";

export function useSessionsReport() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SessionsReportData>({
    total: 0,
    scheduled: 0,
    completed: 0,
    cancelled: 0,
    data: [],
    months: [],
    counts: []
  });

  const fetchData = async (period: ReportPeriod) => {
    setIsLoading(true);
    setError(null);

    try {
      const { startDate, endDate } = getDateRangeFromPeriod(period);
      
      // Get sessions aggregated by day
      const query = supabase
        .from("sessions")
        .select("date_time, status")
        .gte('date_time', startDate.toISOString())
        .lte('date_time', endDate.toISOString())
        .order('date_time');
      
      const { data: sessionsData, error: sessionsError } = await query;
      
      if (sessionsError) throw new Error(sessionsError.message);
      
      // Convert to date strings and group by month
      const sessionsByMonth = new Map<string, number>();
      let scheduled = 0;
      let completed = 0;
      let cancelled = 0;
      
      (sessionsData || []).forEach(session => {
        const date = new Date(session.date_time);
        const monthKey = date.toLocaleString('default', { month: 'short' }) + ' ' + date.getFullYear();
        const count = sessionsByMonth.get(monthKey) || 0;
        sessionsByMonth.set(monthKey, count + 1);
        
        // Count session statuses
        if (session.status === 'Scheduled') {
          scheduled++;
        } else if (session.status === 'Present') {
          completed++;
        } else if (session.status.includes('Cancelled')) {
          cancelled++;
        }
      });
      
      // Build data for chart
      const months: string[] = [];
      const counts: number[] = [];
      const reportData: { date: string; count: number }[] = [];
      
      sessionsByMonth.forEach((count, month) => {
        months.push(month);
        counts.push(count);
        reportData.push({ date: month, count });
      });
      
      setData({
        total: sessionsData?.length || 0,
        scheduled,
        completed,
        cancelled,
        data: reportData,
        months,
        counts
      });
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching sessions report data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    data,
    fetchData,
  };
}
