
import { useQuery } from "@tanstack/react-query";
import { ReportPeriod, AttendanceData, SubjectDistributionData, SessionTypeData, SessionsReportData, StudentProgressData } from "./types";
import { 
  fetchAttendanceData, 
  fetchSubjectDistributionData, 
  fetchSessionTypeData, 
  fetchSessionsOverTimeData,
  fetchStudentProgressData 
} from "./utils";

export const useReports = (period: ReportPeriod = 'month') => {
  const attendanceQuery = useQuery({
    queryKey: ['reports', 'attendance', period],
    queryFn: () => fetchAttendanceData(period),
  });

  const subjectDistributionQuery = useQuery({
    queryKey: ['reports', 'subjects', period],
    queryFn: () => fetchSubjectDistributionData(period),
  });

  const sessionTypeQuery = useQuery({
    queryKey: ['reports', 'sessionTypes', period],
    queryFn: () => fetchSessionTypeData(period),
  });

  const sessionsOverTimeQuery = useQuery({
    queryKey: ['reports', 'sessionsOverTime', period],
    queryFn: () => fetchSessionsOverTimeData(period),
  });

  const studentProgressQuery = useQuery({
    queryKey: ['reports', 'studentProgress', period],
    queryFn: () => fetchStudentProgressData(period),
  });

  return {
    attendanceData: attendanceQuery.data,
    subjectDistribution: subjectDistributionQuery.data,
    sessionTypeData: sessionTypeQuery.data,
    sessionsOverTime: sessionsOverTimeQuery.data,
    studentProgress: studentProgressQuery.data,
    isLoading: 
      attendanceQuery.isLoading || 
      subjectDistributionQuery.isLoading || 
      sessionTypeQuery.isLoading || 
      sessionsOverTimeQuery.isLoading || 
      studentProgressQuery.isLoading,
    isError: 
      attendanceQuery.isError || 
      subjectDistributionQuery.isError || 
      sessionTypeQuery.isError || 
      sessionsOverTimeQuery.isError || 
      studentProgressQuery.isError,
  };
};
