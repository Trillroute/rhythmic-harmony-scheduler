
import { startOfWeek, startOfMonth, subMonths } from 'date-fns';
import { useQuery } from '@tanstack/react-query';

import { useAttendanceReport } from './attendance-report';
import { useSessionTypeReport } from './session-type-report';
import { useSessionsReport } from './sessions-report';
import { useSubjectDistributionReport } from './subject-distribution-report';
import { useStudentProgressReport } from './student-progress-report';
import type { ReportPeriod } from './types';

export const useReports = (period: ReportPeriod = 'week') => {
  // Get start date based on period
  const getStartDate = () => {
    const now = new Date();
    switch (period) {
      case 'week':
        return startOfWeek(now);
      case 'month':
        return startOfMonth(now);
      case 'quarter':
        return subMonths(now, 3);
      case 'year':
        return subMonths(now, 12);
      default:
        return startOfWeek(now);
    }
  };

  // Attendance data
  const attendance = useAttendanceReport(getStartDate());
  
  // Subject distribution data
  const subjectDistribution = useSubjectDistributionReport();
  
  // Student progress data
  const studentProgress = useStudentProgressReport();
  
  // Session type data
  const sessionType = useSessionTypeReport(getStartDate());
  
  // Sessions over time data
  const sessions = useSessionsReport(getStartDate(), period);

  return {
    attendance,
    subjectDistribution,
    studentProgress,
    sessionType,
    sessions,
    isLoading: 
      attendance.isLoading || 
      subjectDistribution.isLoading || 
      studentProgress.isLoading || 
      sessionType.isLoading || 
      sessions.isLoading,
    isError:
      attendance.isError ||
      subjectDistribution.isError ||
      studentProgress.isError ||
      sessionType.isError ||
      sessions.isError,
    refetch: () => {
      attendance.refetch();
      subjectDistribution.refetch();
      studentProgress.refetch();
      sessionType.refetch();
      sessions.refetch();
    }
  };
};

// Re-export types for backward compatibility
export type { ReportPeriod, AttendanceData, SubjectDistributionData, SessionTypeData, SessionsReportData, StudentProgressData } from "./types";
