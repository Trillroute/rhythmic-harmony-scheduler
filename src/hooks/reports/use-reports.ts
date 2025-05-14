
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ReportPeriod, AttendanceData, SubjectDistributionData, SessionTypeData, SessionsReportData, StudentProgressData } from './types';
import { getPeriodDateRange } from './date-utils';

export function useReports() {
  const generateAttendanceReport = async (period: ReportPeriod): Promise<AttendanceData> => {
    const { startDate, endDate } = getPeriodDateRange(period);
    
    // For attendance, we'll use count aggregation with manual SQL
    const { data, error } = await supabase
      .rpc('count_sessions_by_status', {
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      });
      
    if (error) throw error;
    
    if (!data || data.length === 0) {
      return {
        categories: ['Present', 'Absent', 'Cancelled by Student', 'Cancelled by Teacher', 'No Show'],
        data: [0, 0, 0, 0, 0]
      };
    }
    
    // Transform the data
    const statuses = ['Present', 'Absent', 'Cancelled by Student', 'Cancelled by Teacher', 'No Show'];
    const counts = statuses.map(status => {
      const found = data.find(item => item.status === status);
      return found ? parseInt(found.count) : 0;
    });
    
    return {
      data: counts,
      categories: statuses
    };
  };
  
  const generateSubjectDistributionReport = async (period: ReportPeriod): Promise<SubjectDistributionData> => {
    const { startDate, endDate } = getPeriodDateRange(period);
    
    // For subject distribution, we'll use a custom SQL function
    const { data, error } = await supabase
      .rpc('count_sessions_by_subject', {
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      });
      
    if (error) throw error;
    
    if (!data || data.length === 0) {
      return [];
    }
    
    // Transform the data for the chart
    return data.map(item => ({
      name: item.subject,
      value: parseInt(item.count)
    }));
  };
  
  const generateSessionTypeReport = async (period: ReportPeriod): Promise<SessionTypeData> => {
    const { startDate, endDate } = getPeriodDateRange(period);
    
    // For session types by subject, we'll use a custom SQL function
    const { data, error } = await supabase
      .rpc('count_sessions_by_type_and_subject', {
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      });
      
    if (error) throw error;
    
    if (!data || data.length === 0) {
      return [];
    }
    
    return data.map(item => ({
      type: item.session_type,
      subject: item.subject,
      count: parseInt(item.count)
    }));
  };
  
  const generateSessionsReport = async (period: ReportPeriod): Promise<SessionsReportData> => {
    const { startDate, endDate } = getPeriodDateRange(period);
    
    // For sessions over time, we'll use a custom SQL function
    const { data, error } = await supabase
      .rpc('count_sessions_by_month', {
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      });
      
    if (error) throw error;
    
    if (!data || data.length === 0) {
      return { counts: [], months: [] };
    }
    
    // Format months for display
    const months = data.map(item => item.month_name);
    
    // Get the counts
    const counts = data.map(item => parseInt(item.count));
    
    return {
      counts,
      months
    };
  };
  
  const generateStudentProgressReport = async (period: ReportPeriod): Promise<StudentProgressData> => {
    const { startDate, endDate } = getPeriodDateRange(period);
    
    // For student progress, we'll use a custom SQL function
    const { data, error } = await supabase
      .rpc('get_top_student_progress', {
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        limit_count: 10
      });
      
    if (error) throw error;
    
    if (!data || data.length === 0) {
      return [];
    }
    
    // Transform the data
    return data.map(item => ({
      student: item.student_name || 'Unknown Student',
      progress: item.completion_percentage
    }));
  };

  return {
    isLoading: false, // Set based on individual query status
    error: null, // Set based on individual query errors
    generateAttendanceReport,
    generateSubjectDistributionReport,
    generateSessionTypeReport,
    generateSessionsReport,
    generateStudentProgressReport
  };
}

// Export types
export type { ReportPeriod, AttendanceData, SubjectDistributionData, SessionTypeData, SessionsReportData, StudentProgressData };
