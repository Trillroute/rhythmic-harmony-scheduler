
import { useState } from "react";
import { AttendanceData, ReportPeriod } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { assertStringArray, assertAttendanceStatusArray } from "@/lib/type-utils";
import { getDateRangeFromPeriod } from "./date-utils";

export function useAttendanceReport() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AttendanceData>({
    total: 0,
    present: 0,
    absent: 0,
    cancelled: 0,
    noShow: 0,
    distribution: []
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
      
      // Get attendance distribution
      const { data: statusData, error: statusError } = await supabase
        .from("sessions")
        .select("status, count")
        .gte('date_time', startDate.toISOString())
        .lte('date_time', endDate.toISOString())
        .group('status');
      
      if (statusError) throw new Error(statusError.message);
      
      // Count cancelled sessions (aggregate different cancellation reasons)
      const cancellationStatuses = [
        "Cancelled by Student", 
        "Cancelled by Teacher", 
        "Cancelled by School"
      ];

      // Use type assertion to ensure status values are valid
      const cancelledCount = statusData
        .filter(item => cancellationStatuses.includes(String(item.status)))
        .reduce((sum, item) => sum + (item.count as number), 0);
      
      // Count other statuses
      const presentCount = statusData.find(item => item.status === "Present")?.count || 0;
      const absentCount = statusData.find(item => item.status === "Absent")?.count || 0;
      const noShowCount = statusData.find(item => item.status === "No Show")?.count || 0;
      
      // Build distribution data for chart
      const distribution = statusData.map(item => ({
        status: String(item.status),
        count: item.count as number
      }));
      
      setData({
        total: totalCount || 0,
        present: presentCount as number,
        absent: absentCount as number,
        cancelled: cancelledCount,
        noShow: noShowCount as number,
        distribution
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
