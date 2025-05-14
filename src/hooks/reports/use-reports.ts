
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
    
    // Create distribution object
    const distribution = {
      present,
      absent,
      cancelled,
      noShow
    };
    
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
    
    // Transform to structured SubjectDistributionData
    const result: SubjectDistributionData = {
      Guitar: 0,
      Piano: 0,
      Drums: 0,
      Ukulele: 0,
      Vocal: 0
    };
    
    // Process the data
    (data || []).forEach((item: any, index: number) => {
      const subject = item.subject;
      const count = Number(item.count);
      
      // Add to structured format
      if (subject in result) {
        result[subject] = count;
      }
      
      // Add to numeric index properties for backward compatibility
      result[index] = count;
    });
    
    // Prepare chart data separately from index signature
    result.chartData = {
      labels: Object.keys(data || {}).map((i: any) => data[i].subject),
      data: Object.keys(data || {}).map((i: any) => Number(data[i].count))
    };
    
    result.length = data?.length || 0;
    
    return result;
  };
  
  const generateSessionTypeReport = async (period: ReportPeriod): Promise<SessionTypeData> => {
    const { startDate, endDate } = getPeriodDateRange(period);
    
    // For session types by subject, we'll use the SQL function
    const { data, error } = await supabase.rpc('count_sessions_by_type_and_subject', {
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString()
    });
      
    if (error) throw error;
    
    // Transform to structured SessionTypeData
    const result: SessionTypeData = {
      Solo: { type: 'Solo', count: 0, subjects: {} },
      Duo: { type: 'Duo', count: 0, subjects: {} },
      Focus: { type: 'Focus', count: 0, subjects: {} }
    };
    
    // Process the data
    data?.forEach((item: any, index: number) => {
      const sessionType = item.session_type;
      const subject = item.subject;
      const count = Number(item.count);
      
      // Add to structured format
      if (sessionType in result) {
        result[sessionType]!.count += count;
        if (typeof result[sessionType]!.subjects === 'object') {
          const subjects = result[sessionType]!.subjects as Record<string, number>;
          subjects[subject] = count;
        }
      }
    });
    
    result.length = data?.length || 0;
    
    return result;
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
    const reportData = data?.map((item: any) => ({
      date: item.month_name, 
      count: Number(item.count)
    })) || [];
    
    // Also create the months and counts arrays for compatibility
    const months = reportData.map(item => item.date);
    const counts = reportData.map(item => item.count);
    
    // Calculate totals
    const total = counts.reduce((sum, count) => sum + count, 0);
    
    return {
      total,
      scheduled: 0,  // These would need to be calculated from actual status data
      completed: 0,
      cancelled: 0,
      data: reportData,
      months,
      counts
    };
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
    const students = data?.map((item: any) => ({
      studentId: item.student_id,
      studentName: item.student_name || 'Unknown Student',
      completionPercentage: item.completion_percentage || 0,
      student: {
        id: item.student_id,
        name: item.student_name || 'Unknown Student'
      },
      progress: {
        id: item.student_id,
        courseName: "Course",
        instrument: "Instrument",
        completionPercentage: item.completion_percentage || 0
      }
    })) || [];
    
    // Calculate average completion
    const averageCompletion = students.length > 0
      ? Math.round(students.reduce((sum, student) => sum + student.completionPercentage, 0) / students.length)
      : 0;
    
    return { 
      students,
      averageCompletion
    };
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
