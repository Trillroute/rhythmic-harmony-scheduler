
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
      
      // Get all sessions and count them manually by type
      const { data: sessionsData, error: sessionsError } = await supabase
        .from("sessions")
        .select("session_type, subject")
        .gte('date_time', startDate.toISOString())
        .lte('date_time', endDate.toISOString())
        .not('status', 'in', assertStringArray(["Cancelled by Student", "Cancelled by Teacher", "Cancelled by School"]));
      
      if (sessionsError) throw new Error(sessionsError.message);
      
      // Build distribution data for chart - counting session types
      const typeCountMap = new Map<string, Map<string, number>>();
      
      sessionsData.forEach(session => {
        const sessionType = String(session.session_type);
        const subject = String(session.subject);
        
        if (!typeCountMap.has(sessionType)) {
          typeCountMap.set(sessionType, new Map<string, number>());
        }
        
        const subjectMap = typeCountMap.get(sessionType)!;
        const currentCount = subjectMap.get(subject) || 0;
        subjectMap.set(subject, currentCount + 1);
      });
      
      // Convert the nested maps to array format for the chart
      const distribution: SessionTypeData = [];
      
      typeCountMap.forEach((subjectMap, sessionType) => {
        subjectMap.forEach((count, subject) => {
          distribution.push({
            type: sessionType,
            subject: subject,
            count: count
          });
        });
      });
      
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
