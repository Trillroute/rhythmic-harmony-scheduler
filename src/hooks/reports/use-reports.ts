
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ReportPeriod, AttendanceData, SubjectDistributionData, SessionTypeData, SessionsReportData, StudentProgressData } from './types';
import { getPeriodDateRange } from './date-utils';

export function useReports() {
  const generateAttendanceReport = async (period: ReportPeriod): Promise<AttendanceData> => {
    const { startDate, endDate } = getPeriodDateRange(period);
    
    const { data, error } = await supabase
      .from('sessions')
      .select('status, count')
      .gte('date_time', startDate.toISOString())
      .lte('date_time', endDate.toISOString())
      .not('status', 'eq', 'Scheduled')
      .group('status');
      
    if (error) throw error;
    
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
    
    const { data, error } = await supabase
      .from('sessions')
      .select('subject, count')
      .gte('date_time', startDate.toISOString())
      .lte('date_time', endDate.toISOString())
      .group('subject');
      
    if (error) throw error;
    
    // Transform the data for the chart
    const result = data.map(item => ({
      name: item.subject,
      value: parseInt(item.count)
    }));
    
    return result;
  };
  
  const generateSessionTypeReport = async (period: ReportPeriod): Promise<SessionTypeData> => {
    const { startDate, endDate } = getPeriodDateRange(period);
    
    const { data: sessionTypes, error: sessionTypesError } = await supabase
      .from('sessions')
      .select('session_type, count')
      .gte('date_time', startDate.toISOString())
      .lte('date_time', endDate.toISOString())
      .group('session_type');
      
    if (sessionTypesError) throw sessionTypesError;
    
    const { data: subjects, error: subjectsError } = await supabase
      .from('sessions')
      .select('subject, session_type, count')
      .gte('date_time', startDate.toISOString())
      .lte('date_time', endDate.toISOString())
      .group('subject, session_type');
      
    if (subjectsError) throw subjectsError;
    
    // Combine the data
    const result = subjects.map(item => ({
      type: item.session_type,
      subject: item.subject,
      count: parseInt(item.count)
    }));
    
    return result;
  };
  
  const generateSessionsReport = async (period: ReportPeriod): Promise<SessionsReportData> => {
    const { startDate, endDate } = getPeriodDateRange(period);
    const months = [];
    
    // Generate month array
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      months.push(new Date(currentDate));
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    // Format months as YYYY-MM for querying
    const monthStrings = months.map(date => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      return `${year}-${month}`;
    });
    
    // Get session counts by month
    const promises = monthStrings.map(async monthString => {
      const [year, month] = monthString.split('-');
      const firstDay = new Date(parseInt(year), parseInt(month) - 1, 1);
      const lastDay = new Date(parseInt(year), parseInt(month), 0); // Last day of the month
      
      const { count, error } = await supabase
        .from('sessions')
        .select('id', { count: 'exact' })
        .gte('date_time', firstDay.toISOString())
        .lte('date_time', lastDay.toISOString());
        
      if (error) throw error;
      
      return {
        month: monthString,
        count: count || 0
      };
    });
    
    const sessionCounts = await Promise.all(promises);
    
    // Format months for display
    const displayMonths = months.map(date => {
      return date.toLocaleString('default', { month: 'short', year: 'numeric' });
    });
    
    // Get the counts in the same order as displayMonths
    const counts = sessionCounts.map(item => item.count);
    
    return {
      counts,
      months: displayMonths
    };
  };
  
  const generateStudentProgressReport = async (period: ReportPeriod): Promise<StudentProgressData> => {
    const { startDate, endDate } = getPeriodDateRange(period);
    
    const { data, error } = await supabase
      .from('student_progress')
      .select(`
        completion_percentage,
        enrollment:enrollment_id (
          student:student_id (
            profiles:id (
              name
            )
          )
        )
      `)
      .gte('updated_at', startDate.toISOString())
      .lte('updated_at', endDate.toISOString())
      .order('completion_percentage', { ascending: false })
      .limit(10);
      
    if (error) throw error;
    
    // Transform the data
    const result = data.map(item => {
      // Extract student name from the nested relationship - handle potential missing data safely
      const studentName = item.enrollment?.student?.profiles?.name || 'Unknown Student';
      
      return {
        student: studentName,
        progress: item.completion_percentage
      };
    });
    
    return result;
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
export { ReportPeriod, AttendanceData, SubjectDistributionData, SessionTypeData, SessionsReportData, StudentProgressData };
