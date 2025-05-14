
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
      
      // Get session type distribution - using manual counting instead of group
      const { data: sessionsData, error: sessionsError } = await supabase
        .from("sessions")
        .select("session_type, subject")
        .gte('date_time', startDate.toISOString())
        .lte('date_time', endDate.toISOString())
        .not('status', 'in', assertStringArray(["Cancelled by Student", "Cancelled by Teacher", "Cancelled by School"]));
      
      if (sessionsError) throw new Error(sessionsError.message);
      
      // Manually count sessions by type and subject
      const typeSubjectMap = new Map<string, Map<string, number>>();
      
      (sessionsData || []).forEach(session => {
        const type = String(session.session_type);
        const subject = String(session.subject);
        
        if (!typeSubjectMap.has(type)) {
          typeSubjectMap.set(type, new Map<string, number>());
        }
        
        const subjectMap = typeSubjectMap.get(type)!;
        const count = subjectMap.get(subject) || 0;
        subjectMap.set(subject, count + 1);
      });
      
      // Build distribution data for chart
      const distribution: SessionTypeData = [];
      
      typeSubjectMap.forEach((subjectMap, type) => {
        subjectMap.forEach((count, subject) => {
          distribution.push({
            type,
            subject,
            count
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
