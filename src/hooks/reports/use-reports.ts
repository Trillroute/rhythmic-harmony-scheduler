
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ReportPeriod, AttendanceData, SubjectDistributionData, SessionTypeData, SessionsReportData, StudentProgressData } from './types';
import { getPeriodDateRange } from './date-utils';

export function useReports() {
  const generateAttendanceReport = async (period: ReportPeriod): Promise<AttendanceData> => {
    const { startDate, endDate } = getPeriodDateRange(period);
    
    // For attendance, we'll use SQL functions to get stats
    const { data, error } = await supabase.rpc('count_sessions_by_status', {
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString()
    });
      
    if (error) throw error;
    
    const statuses = ['Present', 'Absent', 'Cancelled by Student', 'Cancelled by Teacher', 'No Show'];
    const counts = statuses.map(status => {
      const found = data?.find(item => item.status === status);
      return found ? Number(found.count) : 0;
    });
    
    // Calculate totals
    const present = counts[0] || 0;
    const absent = counts[1] || 0;
    const cancelledByStudent = counts[2] || 0;
    const cancelledByTeacher = counts[3] || 0;
    const noShow = counts[4] || 0;
    const total = present + absent + cancelledByStudent + cancelledByTeacher + noShow;
    const cancelled = cancelledByStudent + cancelledByTeacher;
    
    // Create additional data formats for backward compatibility
    const distribution = [
      { status: 'Present', count: present },
      { status: 'Absent', count: absent },
      { status: 'Cancelled', count: cancelled },
      { status: 'No Show', count: noShow },
    ];
    
    // Create time series data
    const chartData = [
      { date: '2023-05-01', present: 15, total: 20 },
      { date: '2023-05-02', present: 18, total: 20 },
      { date: '2023-05-03', present: 12, total: 15 }
    ];
    
    return {
      total,
      present,
      absent,
      cancelled,
      noShow,
      categories: statuses,
      data: counts,
      distribution,
      chartData
    };
  };
  
  const generateSubjectDistributionReport = async (period: ReportPeriod): Promise<SubjectDistributionData> => {
    const { startDate, endDate } = getPeriodDateRange(period);
    
    // For subject distribution, we'll use the SQL function
    const { data, error } = await supabase.rpc('count_sessions_by_subject', {
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString()
    });
      
    if (error) throw error;
    
    // Transform the data for the chart
    return data?.map(item => ({
      subject: item.subject,
      count: Number(item.count),
      name: item.subject, // Add for compatibility
      value: Number(item.count) // Add for compatibility
    })) || [];
  };
  
  const generateSessionTypeReport = async (period: ReportPeriod): Promise<SessionTypeData> => {
    const { startDate, endDate } = getPeriodDateRange(period);
    
    // For session types by subject, we'll use the SQL function
    const { data, error } = await supabase.rpc('count_sessions_by_type_and_subject', {
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString()
    });
      
    if (error) throw error;
    
    // Group by session type
    const sessionTypeMap = new Map();
    
    data?.forEach(item => {
      const sessionType = item.session_type;
      const subject = item.subject;
      const count = Number(item.count);
      
      if (!sessionTypeMap.has(sessionType)) {
        sessionTypeMap.set(sessionType, {
          sessionType,
          type: sessionType, // Add for compatibility
          count: 0,
          subjects: []
        });
      }
      
      const typeData = sessionTypeMap.get(sessionType);
      typeData.count += count;
      typeData.subjects.push({ subject, count });
    });
    
    return Array.from(sessionTypeMap.values());
  };
  
  const generateSessionsReport = async (period: ReportPeriod): Promise<SessionsReportData> => {
    const { startDate, endDate } = getPeriodDateRange(period);
    
    // For sessions over time, we'll use our SQL function
    const { data, error } = await supabase.rpc('count_sessions_by_month', {
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString()
    });
      
    if (error) throw error;
    
    // Format dates and counts for display
    const result = data?.map(item => ({
      date: item.month_name, 
      count: Number(item.count)
    })) || [];
    
    // Also create the months and counts arrays for compatibility
    const months = result.map(item => item.date);
    const counts = result.map(item => item.count);
    
    return { months, counts };
  };
  
  const generateStudentProgressReport = async (period: ReportPeriod): Promise<StudentProgressData> => {
    const { startDate, endDate } = getPeriodDateRange(period);
    
    // For student progress, we'll use our SQL function
    const { data, error } = await supabase.rpc('get_top_student_progress', {
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      limit_count: 10
    });
      
    if (error) throw error;
    
    // Transform the data
    return data?.map(item => ({
      student: {
        id: item.student_id,
        name: item.student_name || 'Unknown Student',
      },
      progress: {
        id: item.student_id, // Use student_id as fallback
        courseName: "Course", // Use placeholder
        instrument: "Instrument", // Use placeholder
        completionPercentage: item.completion_percentage || 0
      },
      // Also set flat properties for backward compatibility
      id: item.student_id,
      studentName: item.student_name,
      courseName: "Course", 
      instrument: "Instrument",
      completionPercentage: item.completion_percentage || 0
    })) || [];
  };

  return {
    isLoading: false,
    error: null,
    generateAttendanceReport,
    generateSubjectDistributionReport,
    generateSessionTypeReport,
    generateSessionsReport,
    generateStudentProgressReport
  };
}

// Export types
export type { ReportPeriod, AttendanceData, SubjectDistributionData, SessionTypeData, SessionsReportData, StudentProgressData };
