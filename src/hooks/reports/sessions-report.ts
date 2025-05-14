
import { useState } from "react";
import { SessionsReportData, ReportPeriod, SessionsReportPoint } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { getDateRangeFromPeriod } from "./date-utils";
import { assertStringArray } from "@/lib/type-utils";

export function useSessionsReport() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SessionsReportData>({
    totalSessions: 0,
    chartData: []
  });

  const fetchData = async (period: ReportPeriod) => {
    setIsLoading(true);
    setError(null);

    try {
      const { startDate, endDate } = getDateRangeFromPeriod(period);
      
      // Get sessions count
      const { count: totalCount, error: countError } = await supabase
        .from("sessions")
        .select("*", { count: 'exact', head: true })
        .gte('date_time', startDate.toISOString())
        .lte('date_time', endDate.toISOString())
        .not('status', 'in', assertStringArray(["Cancelled by Student", "Cancelled by Teacher", "Cancelled by School"]));
      
      if (countError) throw new Error(countError.message);
      
      // Get sessions for time series
      const { data: sessionsData, error: sessionsError } = await supabase
        .from("sessions")
        .select("date_time")
        .gte('date_time', startDate.toISOString())
        .lte('date_time', endDate.toISOString())
        .not('status', 'in', assertStringArray(["Cancelled by Student", "Cancelled by Teacher", "Cancelled by School"]))
        .order('date_time');
      
      if (sessionsError) throw new Error(sessionsError.message);
      
      // Convert to date strings and group by day
      const sessionsByDay = new Map<string, number>();
      
      sessionsData.forEach(session => {
        const date = new Date(session.date_time).toISOString().split('T')[0];
        const count = sessionsByDay.get(date) || 0;
        sessionsByDay.set(date, count + 1);
      });
      
      // Build data for chart
      const chartData: SessionsReportPoint[] = Array.from(sessionsByDay).map(([date, count]) => ({
        date,
        count
      }));
      
      setData({
        totalSessions: totalCount || 0,
        chartData
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
