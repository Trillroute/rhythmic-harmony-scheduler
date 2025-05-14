
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
      
      // Get all sessions and count them manually by subject
      const { data: sessionsData, error: sessionsError } = await supabase
        .from("sessions")
        .select("subject")
        .gte('date_time', startDate.toISOString())
        .lte('date_time', endDate.toISOString())
        .not('status', 'in', assertStringArray(["Cancelled by Student", "Cancelled by Teacher", "Cancelled by School"]));
      
      if (sessionsError) throw new Error(sessionsError.message);
      
      // Count subjects manually
      const subjectCounts = new Map<string, number>();
      
      sessionsData.forEach(session => {
        const subject = String(session.subject);
        const currentCount = subjectCounts.get(subject) || 0;
        subjectCounts.set(subject, currentCount + 1);
      });
      
      // Build distribution data for chart
      const distribution = Array.from(subjectCounts.entries()).map(([subject, count]) => ({
        name: subject,
        value: count
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
