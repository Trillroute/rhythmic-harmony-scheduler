
import { useAttendanceReport } from "./attendance-report";
import { useSubjectDistributionReport } from "./subject-distribution-report";
import { useSessionTypeReport } from "./session-type-report";
import { useSessionsReport } from "./sessions-report";
import { useStudentProgressReport } from "./student-progress-report";
import { ReportPeriod } from "./types";

export function useReports() {
  const attendanceReport = useAttendanceReport();
  const subjectDistributionReport = useSubjectDistributionReport();
  const sessionTypeReport = useSessionTypeReport();
  const sessionsReport = useSessionsReport();
  const studentProgressReport = useStudentProgressReport();

  const fetchReports = async (period: ReportPeriod) => {
    await Promise.all([
      attendanceReport.fetchAttendanceData(period),
      subjectDistributionReport.fetchSubjectDistribution(period),
      sessionTypeReport.fetchSessionTypeData(period),
      sessionsReport.fetchSessionsData(period),
      studentProgressReport.fetchStudentProgress()
    ]);
  };

  return {
    fetchReports,
    attendance: attendanceReport,
    subjectDistribution: subjectDistributionReport,
    sessionType: sessionTypeReport,
    sessions: sessionsReport,
    studentProgress: studentProgressReport,
    isLoading: 
      attendanceReport.isLoading || 
      subjectDistributionReport.isLoading || 
      sessionTypeReport.isLoading || 
      sessionsReport.isLoading || 
      studentProgressReport.isLoading,
    error: 
      attendanceReport.error || 
      subjectDistributionReport.error || 
      sessionTypeReport.error || 
      sessionsReport.error || 
      studentProgressReport.error
  };
}
