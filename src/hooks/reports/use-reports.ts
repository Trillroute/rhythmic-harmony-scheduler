
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

  const refetch = () => {
    attendanceQuery.refetch();
    subjectDistributionQuery.refetch();
    sessionTypeQuery.refetch();
    sessionsOverTimeQuery.refetch();
    studentProgressQuery.refetch();
  };

  return {
    attendanceData: attendanceQuery.data,
    attendance: { data: attendanceQuery.data }, // Add this alias for backward compatibility
    subjectDistribution: { data: subjectDistributionQuery.data }, // Return data within object
    sessionType: { data: sessionTypeQuery.data }, // Return data within object
    sessions: { data: sessionsOverTimeQuery.data }, // Return data within object
    studentProgress: { data: studentProgressQuery.data }, // Return data within object
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
    refetch // Add the refetch method
  };
};
