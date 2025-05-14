
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AttendanceStatus, SubjectType, SessionType } from '@/lib/types';
import { getDateRangeFromPeriod } from './date-utils';
import { ReportPeriod, AttendanceData, SubjectDistributionData, SessionTypeData, SessionsReportData, StudentProgressData } from './types';

export const useReports = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Generate attendance report
  const generateAttendanceReport = useCallback(async (period: ReportPeriod): Promise<AttendanceData> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { from, to } = getDateRangeFromPeriod(period);
      
      const { data: sessions, error: sessionsError } = await supabase
        .from('sessions')
        .select('status')
        .gte('date_time', from.toISOString())
        .lte('date_time', to.toISOString());
        
      if (sessionsError) throw new Error(sessionsError.message);
      
      // Count each status type
      const presentCount = sessions.filter(session => session.status === 'Present').length;
      const absentCount = sessions.filter(session => session.status === 'Absent').length;
      const scheduledCount = sessions.filter(session => session.status === 'Scheduled').length;
      const cancelledByStudentCount = sessions.filter(session => session.status === 'Cancelled by Student').length;
      const cancelledByTeacherCount = sessions.filter(session => session.status === 'Cancelled by Teacher').length;
      const cancelledBySchoolCount = sessions.filter(session => session.status === 'Cancelled by School').length;
      const noShowCount = sessions.filter(session => session.status === 'No Show').length;
      
      return {
        labels: ['Present', 'Absent', 'Scheduled', 'Cancelled by Student', 'Cancelled by Teacher', 'Cancelled by School', 'No Show'],
        datasets: [
          {
            data: [presentCount, absentCount, scheduledCount, cancelledByStudentCount, cancelledByTeacherCount, cancelledBySchoolCount, noShowCount],
            backgroundColor: [
              '#4ade80', // Present - Green
              '#f87171', // Absent - Red
              '#60a5fa', // Scheduled - Blue
              '#fbbf24', // Cancelled by Student - Yellow
              '#a78bfa', // Cancelled by Teacher - Purple
              '#94a3b8', // Cancelled by School - Gray
              '#fb7185'  // No Show - Pink
            ]
          }
        ]
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to generate attendance report');
      setError(error);
      return {
        labels: [],
        datasets: [{ data: [], backgroundColor: [] }]
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Generate subject distribution report
  const generateSubjectDistributionReport = useCallback(async (period: ReportPeriod): Promise<SubjectDistributionData> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { from, to } = getDateRangeFromPeriod(period);
      
      const { data: sessions, error: sessionsError } = await supabase
        .from('sessions')
        .select('subject')
        .gte('date_time', from.toISOString())
        .lte('date_time', to.toISOString());
        
      if (sessionsError) throw new Error(sessionsError.message);
      
      // Count each subject type
      const guitarCount = sessions.filter(session => session.subject === 'Guitar').length;
      const pianoCount = sessions.filter(session => session.subject === 'Piano').length;
      const drumsCount = sessions.filter(session => session.subject === 'Drums').length;
      const ukuleleCount = sessions.filter(session => session.subject === 'Ukulele').length;
      const vocalCount = sessions.filter(session => session.subject === 'Vocal').length;
      
      return {
        labels: ['Guitar', 'Piano', 'Drums', 'Ukulele', 'Vocal'],
        datasets: [
          {
            data: [guitarCount, pianoCount, drumsCount, ukuleleCount, vocalCount],
            backgroundColor: [
              '#4ade80', // Guitar - Green
              '#60a5fa', // Piano - Blue
              '#f87171', // Drums - Red
              '#fbbf24', // Ukulele - Yellow
              '#a78bfa'  // Vocal - Purple
            ]
          }
        ]
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to generate subject distribution report');
      setError(error);
      return {
        labels: [],
        datasets: [{ data: [], backgroundColor: [] }]
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Generate session type report
  const generateSessionTypeReport = useCallback(async (period: ReportPeriod): Promise<SessionTypeData> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { from, to } = getDateRangeFromPeriod(period);
      
      const { data: sessions, error: sessionsError } = await supabase
        .from('sessions')
        .select('session_type')
        .gte('date_time', from.toISOString())
        .lte('date_time', to.toISOString());
        
      if (sessionsError) throw new Error(sessionsError.message);
      
      // Count each session type
      const soloCount = sessions.filter(session => session.session_type === 'Solo').length;
      const duoCount = sessions.filter(session => session.session_type === 'Duo').length;
      const focusCount = sessions.filter(session => session.session_type === 'Focus').length;
      
      return {
        labels: ['Solo', 'Duo', 'Focus'],
        datasets: [
          {
            data: [soloCount, duoCount, focusCount],
            backgroundColor: [
              '#4ade80', // Solo - Green
              '#60a5fa', // Duo - Blue
              '#f87171'  // Focus - Red
            ]
          }
        ]
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to generate session type report');
      setError(error);
      return {
        labels: [],
        datasets: [{ data: [], backgroundColor: [] }]
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Generate sessions over time report
  const generateSessionsReport = useCallback(async (period: ReportPeriod): Promise<SessionsReportData> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { from, to } = getDateRangeFromPeriod(period);
      
      const { data: sessions, error: sessionsError } = await supabase
        .from('sessions')
        .select('date_time')
        .gte('date_time', from.toISOString())
        .lte('date_time', to.toISOString())
        .order('date_time');
        
      if (sessionsError) throw new Error(sessionsError.message);
      
      // Group sessions by week or month depending on the period
      const timeFormat = period === 'week' || period === 'month' ? 'day' : 'week';
      
      // Format dates for display
      const dateLabels: string[] = [];
      const sessionCounts: number[] = [];
      
      // Simple grouping by date for now - can be enhanced for more complex periods
      const dateMap = new Map<string, number>();
      
      sessions.forEach(session => {
        const date = new Date(session.date_time);
        const dateString = date.toLocaleDateString();
        
        if (dateMap.has(dateString)) {
          dateMap.set(dateString, dateMap.get(dateString)! + 1);
        } else {
          dateMap.set(dateString, 1);
        }
      });
      
      // Convert map to arrays
      for (const [date, count] of dateMap.entries()) {
        dateLabels.push(date);
        sessionCounts.push(count);
      }
      
      return {
        labels: dateLabels,
        datasets: [
          {
            label: 'Sessions',
            data: sessionCounts,
            backgroundColor: '#60a5fa',
            borderColor: '#3b82f6',
            borderWidth: 1
          }
        ]
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to generate sessions report');
      setError(error);
      return {
        labels: [],
        datasets: [{ label: 'Sessions', data: [], backgroundColor: '', borderColor: '', borderWidth: 1 }]
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Generate student progress report
  const generateStudentProgressReport = useCallback(async (): Promise<StudentProgressData> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get top 10 students by completion percentage
      const { data: progresses, error: progressError } = await supabase
        .from('student_progress')
        .select(`
          completion_percentage,
          enrollment_id,
          enrollment:enrollment_id(
            student_id,
            course_id,
            course:course_id(name)
          )
        `)
        .order('completion_percentage', { ascending: false })
        .limit(10);
        
      if (progressError) throw new Error(progressError.message);
      
      // Get student names
      const studentIds = progresses.map(p => p.enrollment?.student_id).filter(Boolean);
      
      let studentNames: { [key: string]: string } = {};
      
      if (studentIds.length > 0) {
        const { data: students, error: studentsError } = await supabase
          .from('profiles')
          .select('id, name')
          .in('id', studentIds);
          
        if (studentsError) throw new Error(studentsError.message);
        
        studentNames = students.reduce((acc, student) => {
          acc[student.id] = student.name;
          return acc;
        }, {} as { [key: string]: string });
      }
      
      // Format data for chart
      const studentData = progresses.map(progress => {
        const studentId = progress.enrollment?.student_id;
        const courseName = progress.enrollment?.course?.name || 'Unknown Course';
        const studentName = studentId ? (studentNames[studentId] || 'Unknown Student') : 'Unknown Student';
        
        return {
          studentName,
          courseName,
          completionPercentage: progress.completion_percentage
        };
      });
      
      return studentData;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to generate student progress report');
      setError(error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    generateAttendanceReport,
    generateSubjectDistributionReport,
    generateSessionTypeReport,
    generateSessionsReport,
    generateStudentProgressReport
  };
};

// Re-export the types from the types file
export type { ReportPeriod, AttendanceData, SubjectDistributionData, SessionTypeData, SessionsReportData, StudentProgressData };
