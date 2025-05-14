
import { useState } from "react";
import { SessionTypeData, ReportPeriod } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { getDateRangeFromPeriod } from "./date-utils";
import { assertStringArray } from "@/lib/type-utils";

export function useSessionTypeReport() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SessionTypeData>([]);

  const fetchData = async (period: ReportPeriod) => {
    setIsLoading(true);
    setError(null);

    try {
      const { startDate, endDate } = getDateRangeFromPeriod(period);
      
      // Get session type distribution
      const { data: typeData, error: typeError } = await supabase
        .from("sessions")
        .select("session_type, subject, count")
        .gte('date_time', startDate.toISOString())
        .lte('date_time', endDate.toISOString())
        .not('status', 'in', assertStringArray(["Cancelled by Student", "Cancelled by Teacher", "Cancelled by School"]))
        .group('session_type, subject');
      
      if (typeError) throw new Error(typeError.message);
      
      // Build distribution data for chart
      const distribution = typeData.map(item => ({
        type: String(item.session_type),
        subject: String(item.subject),
        count: item.count as number
      }));
      
      setData(distribution);
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching session type data:", err);
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
