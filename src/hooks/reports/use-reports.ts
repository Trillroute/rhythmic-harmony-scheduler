
import { ReportPeriod } from "./types";
import { useAttendanceReport } from "./attendance-report";
import { useSubjectDistributionReport } from "./subject-distribution-report";
import { useSessionTypeReport } from "./session-type-report";
import { useSessionsReport } from "./sessions-report";
import { useStudentProgressReport } from "./student-progress-report";

// Main hook that combines all report data
export const useReports = (period: 'week' | 'month' | 'quarter' = 'month', filters?: ReportPeriod) => {
  const attendanceQuery = useAttendanceReport(period, filters);
  const subjectQuery = useSubjectDistributionReport(filters);
  const sessionTypeQuery = useSessionTypeReport(filters);
  const sessionsQuery = useSessionsReport(filters);
  const studentProgressQuery = useStudentProgressReport(filters);
  
  return {
    // Attendance data
    attendanceData: attendanceQuery.data,
    isLoadingAttendance: attendanceQuery.isLoading,
    attendanceError: attendanceQuery.error,
    
    // Subject distribution data
    subjectData: subjectQuery.data,
    isLoadingSubject: subjectQuery.isLoading,
    subjectError: subjectQuery.error,
    
    // Session type data
    sessionTypeData: sessionTypeQuery.data,
    isLoadingSessionType: sessionTypeQuery.isLoading,
    sessionTypeError: sessionTypeQuery.error,
    
    // Sessions report data
    sessionsData: sessionsQuery.data,
    isLoadingSessions: sessionsQuery.isLoading,
    sessionsError: sessionsQuery.error,
    
    // Student progress data
    studentProgressData: studentProgressQuery.data,
    isLoadingStudentProgress: studentProgressQuery.isLoading,
    studentProgressError: studentProgressQuery.error,
    
    // Combined loading state
    isLoading: 
      attendanceQuery.isLoading || 
      subjectQuery.isLoading || 
      sessionTypeQuery.isLoading ||
      sessionsQuery.isLoading ||
      studentProgressQuery.isLoading,
    
    // Function to refetch all reports
    refetchReports: () => {
      attendanceQuery.refetch();
      subjectQuery.refetch();
      sessionTypeQuery.refetch();
      sessionsQuery.refetch();
      studentProgressQuery.refetch();
    }
  };
};
