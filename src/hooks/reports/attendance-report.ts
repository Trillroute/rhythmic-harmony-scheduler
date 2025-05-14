
import { useState } from "react";
import { AttendanceData, ReportPeriod } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { assertStringArray, assertAttendanceStatusArray } from "@/lib/type-utils";
import { getDateRangeFromPeriod } from "./date-utils";
import { format, addDays } from "date-fns";

export function useAttendanceReport() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AttendanceData>({
    total: 0,
    present: 0,
    absent: 0,
    cancelled: 0,
    noShow: 0,
    distribution: [],
    chartData: []
  });

  const fetchAttendanceData = async (period: ReportPeriod) => {
    setIsLoading(true);
    setError(null);

    try {
      const { startDate, endDate } = getDateRangeFromPeriod(period);
      
      // Get all sessions in period to calculate statuses manually
      const { data: sessionsData, error: sessionsError, count: totalCount } = await supabase
        .from("sessions")
        .select("*", { count: 'exact' })
        .gte('date_time', startDate.toISOString())
        .lte('date_time', endDate.toISOString());
      
      if (sessionsError) throw new Error(sessionsError.message);
      
      // Count by status manually
      const statusCounts = new Map<string, number>();
      
      (sessionsData || []).forEach(session => {
        const status = String(session.status);
        const count = statusCounts.get(status) || 0;
        statusCounts.set(status, count + 1);
      });
      
      // Count cancelled sessions (aggregate different cancellation reasons)
      const cancellationStatuses = [
        "Cancelled by Student", 
        "Cancelled by Teacher", 
        "Cancelled by School"
      ];

      let cancelledCount = 0;
      cancellationStatuses.forEach(status => {
        cancelledCount += statusCounts.get(status) || 0;
      });
      
      // Count other statuses
      const presentCount = statusCounts.get("Present") || 0;
      const absentCount = statusCounts.get("Absent") || 0;
      const noShowCount = statusCounts.get("No Show") || 0;
      
      // Build distribution data for chart
      const distribution = Array.from(statusCounts.entries()).map(([status, count]) => ({
        status,
        count
      }));

      // Create chart data - daily attendance trends
      const chartData = [];
      let currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        const dateStr = format(currentDate, 'yyyy-MM-dd');
        const dayData = {
          date: format(currentDate, 'MMM dd'),
          present: 0,
          total: 0
        };
        
        // Count sessions for this day
        (sessionsData || []).forEach(session => {
          const sessionDate = format(new Date(session.date_time), 'yyyy-MM-dd');
          if (sessionDate === dateStr) {
            dayData.total++;
            if (session.status === 'Present') {
              dayData.present++;
            }
          }
        });
        
        chartData.push(dayData);
        currentDate = addDays(currentDate, 1);
      }
      
      setData({
        total: totalCount || 0,
        present: presentCount,
        absent: absentCount,
        cancelled: cancelledCount,
        noShow: noShowCount,
        distribution,
        chartData
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
