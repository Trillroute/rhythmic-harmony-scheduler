
import { useState } from "react";
import { SubjectDistributionData, ReportPeriod } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { getDateRangeFromPeriod } from "./date-utils";
import { assertStringArray } from "@/lib/type-utils";

export function useSubjectDistributionReport() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SubjectDistributionData>([]);

  const fetchSubjectData = async (period: ReportPeriod) => {
    setIsLoading(true);
    setError(null);

    try {
      const { startDate, endDate } = getDateRangeFromPeriod(period);
      
      // Get subject distribution - we need to use group() instead of groupBy()
      const { data: subjectData, error: subjectError } = await supabase
        .from("sessions")
        .select("subject, count(*)")
        .gte('date_time', startDate.toISOString())
        .lte('date_time', endDate.toISOString())
        .not('status', 'in', assertStringArray(["Cancelled by Student", "Cancelled by Teacher", "Cancelled by School"]))
        .group('subject');
      
      if (subjectError) throw new Error(subjectError.message);
      
      // Build distribution data for chart
      const distribution = subjectData.map(item => ({
        name: String(item.subject),
        value: parseInt(item.count as unknown as string, 10)
      }));
      
      setData(distribution);
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching subject distribution data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    data,
    fetchSubjectData,
  };
}
