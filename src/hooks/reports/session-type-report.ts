
import { useState } from "react";
import { SessionTypeData, ReportPeriod, SessionTypeItem } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { getDateRangeFromPeriod } from "./date-utils";
import { assertStringArray } from "@/lib/type-utils";

export function useSessionTypeReport() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SessionTypeData>({
    Solo: { type: 'Solo', count: 0, subjects: {} },
    Duo: { type: 'Duo', count: 0, subjects: {} },
    Focus: { type: 'Focus', count: 0, subjects: {} },
  });

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
        const sessionType = String(session.session_type);
        const subject = String(session.subject);
        
        if (!typeSubjectMap.has(sessionType)) {
          typeSubjectMap.set(sessionType, new Map<string, number>());
        }
        
        const subjectMap = typeSubjectMap.get(sessionType)!;
        const count = subjectMap.get(subject) || 0;
        subjectMap.set(subject, count + 1);
      });
      
      // Build distribution data for chart
      const distribution: Record<string, SessionTypeItem> = {
        Solo: { type: 'Solo', count: 0, subjects: {} },
        Duo: { type: 'Duo', count: 0, subjects: {} },
        Focus: { type: 'Focus', count: 0, subjects: {} }
      };
      
      typeSubjectMap.forEach((subjectMap, type) => {
        let typeTotal = 0;
        const subjects: Record<string, number> = {};
        
        subjectMap.forEach((count, subject) => {
          typeTotal += count;
          subjects[subject] = count;
        });
        
        if (type in distribution) {
          distribution[type] = {
            type,
            count: typeTotal,
            subjects
          };
        }
      });
      
      setData(distribution as SessionTypeData);
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
