
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  generateAttendanceReport, 
  generateSubjectDistributionReport, 
  generateSessionTypeReport,
  generateSessionsReport,
  generateStudentProgressReport
} from './utils';
import { 
  AttendanceData, 
  SubjectDistributionData, 
  SessionTypeData, 
  SessionsReportData,
  StudentProgressData,
  ReportPeriod
} from './types';
import { getDateRangeForPeriod } from './date-utils';

export const useReports = (period: ReportPeriod = 'month') => {
  const { startDate, endDate } = getDateRangeForPeriod(period);

  const fetchReportData = async () => {
    try {
      // Attendance data
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('sessions')
        .select('*')
        .gte('date_time', startDate.toISOString())
        .lte('date_time', endDate.toISOString());

      if (attendanceError) throw new Error(attendanceError.message);

      // Student progress data
      const { data: progressData, error: progressError } = await supabase
        .from('student_progress')
        .select(`
          *,
          enrollment:enrollment_id(
            student_id,
            course_id,
            profiles:student_id(name),
            courses:course_id(name, instrument)
          )
        `)
        .gte('updated_at', startDate.toISOString())
        .lte('updated_at', endDate.toISOString());

      if (progressError) throw new Error(progressError.message);

      return {
        attendanceData: generateAttendanceReport(attendanceData || []),
        subjectDistribution: generateSubjectDistributionReport(attendanceData || []),
        sessionTypeData: generateSessionTypeReport(attendanceData || []),
        sessionsOverTime: generateSessionsReport(attendanceData || [], startDate, endDate),
        studentProgress: generateStudentProgressReport(progressData || [])
      };
    } catch (error) {
      console.error('Error fetching report data:', error);
      throw error;
    }
  };

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['reports', period],
    queryFn: fetchReportData
  });

  // Return transformed data structure with correct property names used in ReportingDashboard
  return {
    // Map to the property names used in ReportingDashboard
    attendance: {
      data: data?.attendanceData || {
        total: 0,
        present: 0,
        absent: 0,
        cancelled: 0,
        noShow: 0,
        distribution: [],
        chartData: []
      }
    },
    subjectDistribution: {
      data: data?.subjectDistribution || []
    },
    sessionType: {
      data: data?.sessionTypeData || []
    },
    sessions: {
      data: data?.sessionsOverTime || []
    },
    studentProgress: {
      data: data?.studentProgress || []
    },
    isLoading,
    isError,
    refetch  // Add refetch method
  };
};
