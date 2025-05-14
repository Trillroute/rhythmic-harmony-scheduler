
import { useState } from "react";
import { AttendanceData, ReportPeriod } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { assertStringArray } from "@/lib/type-utils";
import { getDateRangeFromPeriod } from "./date-utils";

export function useAttendanceReport() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AttendanceData>({
    attendanceRate: 0,
    chartData: [],
    summary: {
      present: 0,
      absent: 0,
      total: 0,
      cancelled: 0,
      noShow: 0
    }
  });

  const fetchAttendanceData = async (period: ReportPeriod) => {
    setIsLoading(true);
    setError(null);

    try {
      const { startDate, endDate } = getDateRangeFromPeriod(period);
      
      // Get total sessions in period
      const { count: totalCount, error: totalError } = await supabase
        .from("sessions")
        .select("*", { count: 'exact', head: true })
        .gte('date_time', startDate.toISOString())
        .lte('date_time', endDate.toISOString());
      
      if (totalError) throw new Error(totalError.message);
      
      // Get attendance distribution - fetch all statuses and count them manually
      const { data: statusData, error: statusError } = await supabase
        .from("sessions")
        .select("status")
        .gte('date_time', startDate.toISOString())
        .lte('date_time', endDate.toISOString());
      
      if (statusError) throw new Error(statusError.message);
      
      // Count cancelled sessions (aggregate different cancellation reasons)
      const cancellationStatuses = [
        "Cancelled by Student", 
        "Cancelled by Teacher", 
        "Cancelled by School"
      ];

      // Process the status data to count different statuses
      let presentCount = 0;
      let absentCount = 0;
      let noShowCount = 0;
      let cancelledCount = 0;
      
      statusData.forEach(item => {
        const status = String(item.status);
        
        if (status === "Present") {
          presentCount += 1;
        } else if (status === "Absent") {
          absentCount += 1;
        } else if (status === "No Show") {
          noShowCount += 1;
        } else if (cancellationStatuses.includes(status)) {
          cancelledCount += 1;
        }
      });
      
      // Get attendance over time for chart
      const { data: timeSeriesData, error: timeSeriesError } = await supabase
        .from("sessions")
        .select("date_time, status")
        .gte('date_time', startDate.toISOString())
        .lte('date_time', endDate.toISOString())
        .not('status', 'in', assertStringArray(cancellationStatuses));
        
      if (timeSeriesError) throw new Error(timeSeriesError.message);
      
      // Process data for chart - group by date
      const dateMap = new Map<string, { present: number, total: number }>();
      
      timeSeriesData.forEach(session => {
        const date = new Date(session.date_time).toISOString().split('T')[0];
        const isPresent = session.status === 'Present';
        
        if (!dateMap.has(date)) {
          dateMap.set(date, { present: 0, total: 0 });
        }
        
        const entry = dateMap.get(date)!;
        if (isPresent) {
          entry.present += 1;
        }
        entry.total += 1;
      });
      
      // Convert map to array for chart
      const chartData = Array.from(dateMap.entries()).map(([date, counts]) => ({
        date,
        present: counts.present,
        total: counts.total
      }));
      
      const totalSessionCount = totalCount || 0;
      const attendanceRate = totalSessionCount > 0 ? (presentCount / totalSessionCount * 100) : 0;
      
      setData({
        attendanceRate,
        chartData,
        summary: {
          present: presentCount,
          absent: absentCount,
          total: totalSessionCount,
          cancelled: cancelledCount,
          noShow: noShowCount
        }
      });
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching attendance data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    data,
    fetchAttendanceData,
  };
}
