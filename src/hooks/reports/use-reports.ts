
import { useQuery } from "@tanstack/react-query";
import { useAttendanceReport } from "./attendance-report";
import { useSubjectDistributionReport } from "./subject-distribution-report";
import { useSessionTypeReport } from "./session-type-report";
import { useSessionsReport } from "./sessions-report";
import { useStudentProgressReport } from "./student-progress-report";
import { ReportPeriod } from "./types";

export function useReports() {
  const attendance = useAttendanceReport();
  const subjectDistribution = useSubjectDistributionReport();
  const sessionType = useSessionTypeReport();
  const sessions = useSessionsReport();
  const studentProgress = useStudentProgressReport();

  const fetchReports = async (period: ReportPeriod) => {
    try {
      // Use promise.all to fetch data in parallel
      await Promise.all([
        attendance.fetchAttendanceData(period),
        // Use correct function names from the respective hooks
        subjectDistribution.fetchSubjectData(period),
        sessionType.fetchData(period),
        sessions.fetchData(period),
        studentProgress.fetchData()
      ]);
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

  return {
    fetchReports,
    attendance,
    subjectDistribution,
    sessionType,
    sessions,
    studentProgress,
    isLoading: 
      attendance.isLoading || 
      subjectDistribution.isLoading || 
      sessionType.isLoading || 
      sessions.isLoading || 
      studentProgress.isLoading,
    error: 
      attendance.error || 
      subjectDistribution.error || 
      sessionType.error || 
      sessions.error || 
      studentProgress.error
  };
}
