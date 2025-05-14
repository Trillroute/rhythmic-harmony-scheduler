
import { useState } from 'react';
import { addDays, addMonths, startOfDay, startOfMonth, endOfMonth, format } from 'date-fns';
import { 
  ReportPeriod, 
  AttendanceData, 
  SubjectDistributionData, 
  SessionTypeData, 
  SessionsReportData,
  StudentProgressData
} from './types';
import { supabase } from '@/integrations/supabase/client';

export const useReports = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Generate attendance report based on period
  const generateAttendanceReport = async (period: ReportPeriod): Promise<AttendanceData> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Calculate date range based on period
      const { startDate, endDate } = getDateRangeFromPeriod(period);
      
      // Fetch data from Supabase
      const { data, error } = await supabase
        .from('attendance_events')
        .select(`
          status,
          marked_at,
          sessions!inner(date_time)
        `)
        .gte('sessions.date_time', startDate.toISOString())
        .lte('sessions.date_time', endDate.toISOString());
      
      if (error) throw new Error(error.message);
      
      // Process data for report
      const statusCounts: Record<string, number> = {
        'Completed': 0,
        'Cancelled by Student': 0,
        'Cancelled by Teacher': 0,
        'Cancelled by School': 0,
        'No Show': 0,
        'Scheduled': 0
      };
      
      // Count occurrences of each status
      data.forEach((record) => {
        const status = record.status;
        if (status in statusCounts) {
          statusCounts[status]++;
        }
      });
      
      // Prepare data for chart
      const labels = Object.keys(statusCounts);
      const values = Object.values(statusCounts);
      
      return {
        labels,
        data: values,
        period,
        totalSessions: values.reduce((sum, value) => sum + value, 0)
      };
      
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Generate subject distribution report
  const generateSubjectDistributionReport = async (period: ReportPeriod): Promise<SubjectDistributionData> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Calculate date range based on period
      const { startDate, endDate } = getDateRangeFromPeriod(period);
      
      // Fetch data from Supabase
      const { data, error } = await supabase
        .from('sessions')
        .select('subject, id')
        .gte('date_time', startDate.toISOString())
        .lte('date_time', endDate.toISOString())
        .neq('status', 'Cancelled by Student')
        .neq('status', 'Cancelled by Teacher')
        .neq('status', 'Cancelled by School');
      
      if (error) throw new Error(error.message);
      
      // Process data for report
      const subjectCounts: Record<string, number> = {};
      
      // Count sessions for each subject
      data.forEach((session) => {
        const subject = session.subject;
        if (subject) {
          subjectCounts[subject] = (subjectCounts[subject] || 0) + 1;
        }
      });
      
      // Prepare data for chart
      const labels = Object.keys(subjectCounts);
      const values = Object.values(subjectCounts);
      
      return {
        labels,
        data: values,
        period,
        totalSessions: values.reduce((sum, value) => sum + value, 0)
      };
      
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Generate session type report
  const generateSessionTypeReport = async (period: ReportPeriod): Promise<SessionTypeData> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Calculate date range based on period
      const { startDate, endDate } = getDateRangeFromPeriod(period);
      
      // Fetch data from Supabase
      const { data, error } = await supabase
        .from('sessions')
        .select('session_type, id')
        .gte('date_time', startDate.toISOString())
        .lte('date_time', endDate.toISOString())
        .neq('status', 'Cancelled by Student')
        .neq('status', 'Cancelled by Teacher')
        .neq('status', 'Cancelled by School');
      
      if (error) throw new Error(error.message);
      
      // Process data for report
      const typeCounts: Record<string, number> = {};
      
      // Count sessions for each type
      data.forEach((session) => {
        const type = session.session_type;
        if (type) {
          typeCounts[type] = (typeCounts[type] || 0) + 1;
        }
      });
      
      // Prepare data for chart
      const labels = Object.keys(typeCounts);
      const values = Object.values(typeCounts);
      
      return {
        labels,
        data: values,
        period,
        totalSessions: values.reduce((sum, value) => sum + value, 0)
      };
      
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Generate sessions over time report
  const generateSessionsReport = async (period: ReportPeriod): Promise<SessionsReportData> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Calculate date range based on period
      const { startDate, endDate } = getDateRangeFromPeriod(period);
      
      // Fetch data from Supabase
      const { data, error } = await supabase
        .from('sessions')
        .select('date_time, status')
        .gte('date_time', startDate.toISOString())
        .lte('date_time', endDate.toISOString());
      
      if (error) throw new Error(error.message);
      
      // Process data for report
      const dateFormat = period === '7days' || period === '30days' ? 'MMM dd' : 'MMM yyyy';
      const groupedSessions: Record<string, { total: number, completed: number }> = {};
      
      // Group sessions by date
      data.forEach((session) => {
        const date = new Date(session.date_time);
        const formattedDate = format(date, dateFormat);
        
        if (!groupedSessions[formattedDate]) {
          groupedSessions[formattedDate] = { total: 0, completed: 0 };
        }
        
        groupedSessions[formattedDate].total++;
        
        if (session.status === 'Completed') {
          groupedSessions[formattedDate].completed++;
        }
      });
      
      // Prepare data for chart
      const labels = Object.keys(groupedSessions);
      const totalValues = labels.map(label => groupedSessions[label].total);
      const completedValues = labels.map(label => groupedSessions[label].completed);
      
      return {
        labels,
        totalData: totalValues,
        completedData: completedValues,
        period,
        totalSessions: totalValues.reduce((sum, value) => sum + value, 0),
        completedSessions: completedValues.reduce((sum, value) => sum + value, 0)
      };
      
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Generate student progress report
  const generateStudentProgressReport = async (period: ReportPeriod): Promise<StudentProgressData> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Calculate date range based on period
      const { startDate, endDate } = getDateRangeFromPeriod(period);
      
      // Fetch data from Supabase
      const { data, error } = await supabase
        .from('student_progress')
        .select(`
          id,
          completion_percentage,
          updated_at,
          enrollments(
            student_id,
            students!inner(
              profiles!inner(name)
            ),
            courses!inner(name)
          )
        `)
        .gte('updated_at', startDate.toISOString())
        .lte('updated_at', endDate.toISOString())
        .order('updated_at', { ascending: false })
        .limit(10);
      
      if (error) throw new Error(error.message);
      
      // Process data for report
      const progressData = data.map(item => {
        const enrollment = item.enrollments;
        const studentName = enrollment?.students?.profiles?.name || 'Unknown';
        const courseName = enrollment?.courses?.name || 'Unknown';
        
        return {
          id: item.id,
          studentName,
          courseName,
          completionPercentage: item.completion_percentage,
          updatedAt: new Date(item.updated_at)
        };
      });
      
      return {
        data: progressData,
        period
      };
      
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to calculate date range based on period
  const getDateRangeFromPeriod = (period: ReportPeriod) => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;
    
    switch (period) {
      case '7days':
        startDate = addDays(now, -7);
        break;
      case '30days':
        startDate = addDays(now, -30);
        break;
      case 'thisMonth':
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case 'lastMonth':
        startDate = startOfMonth(addMonths(now, -1));
        endDate = endOfMonth(addMonths(now, -1));
        break;
      case '90days':
        startDate = addDays(now, -90);
        break;
      case '6months':
        startDate = addMonths(now, -6);
        break;
      case '12months':
        startDate = addMonths(now, -12);
        break;
      default:
        startDate = addDays(now, -30);
    }
    
    // Set time to start of day for start date and end of day for end date
    startDate = startOfDay(startDate);
    endDate.setHours(23, 59, 59, 999);
    
    return { startDate, endDate };
  };

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
