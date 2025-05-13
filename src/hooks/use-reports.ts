
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../integrations/supabase/client";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { AttendanceStatus, SubjectType } from "@/lib/types";

interface AttendanceData {
  attendanceRate: number;
  chartData: {
    date: string;
    total: number;
    present: number;
    rate: number;
  }[];
}

interface SubjectDistributionData {
  chartData: {
    subject: string;
    sessions: number;
    solo: number;
    duo: number;
    focus: number;
  }[];
}

interface SessionTypeData {
  chartData: {
    name: string;
    value: number;
  }[];
}

export const useReports = (period: 'week' | 'month' | 'quarter' = 'month') => {
  // Get attendance data
  const fetchAttendanceData = async (): Promise<AttendanceData> => {
    const endDate = new Date();
    let startDate;
    
    switch (period) {
      case 'week':
        startDate = new Date(endDate);
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'quarter':
        startDate = subMonths(endDate, 3);
        break;
      case 'month':
      default:
        startDate = startOfMonth(endDate);
        startDate = subMonths(startDate, 1); // Get last month data too
        break;
    }
    
    const { data, error } = await supabase
      .from('sessions')
      .select('date_time, status')
      .gte('date_time', startDate.toISOString())
      .lte('date_time', endDate.toISOString());
      
    if (error) throw error;
    
    // Group by date
    const groupedByDate: Record<string, { total: number, present: number }> = {};
    
    data.forEach(session => {
      const dateKey = format(new Date(session.date_time), 'yyyy-MM-dd');
      
      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = { total: 0, present: 0 };
      }
      
      groupedByDate[dateKey].total += 1;
      if (session.status === 'Present') {
        groupedByDate[dateKey].present += 1;
      }
    });
    
    // Calculate overall attendance rate
    let totalSessions = 0;
    let totalPresent = 0;
    
    Object.values(groupedByDate).forEach(val => {
      totalSessions += val.total;
      totalPresent += val.present;
    });
    
    const attendanceRate = totalSessions > 0 ? (totalPresent / totalSessions) * 100 : 0;
    
    // Format for chart
    const chartData = Object.entries(groupedByDate).map(([date, stats]) => ({
      date: format(new Date(date), 'MMM dd'),
      total: stats.total,
      present: stats.present,
      rate: stats.total > 0 ? (stats.present / stats.total) * 100 : 0
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return {
      attendanceRate,
      chartData
    };
  };
  
  // Get subject distribution data
  const fetchSubjectDistribution = async (): Promise<SubjectDistributionData> => {
    const { data, error } = await supabase
      .from('sessions')
      .select('subject, session_type');
      
    if (error) throw error;
    
    const subjectCounts: Record<SubjectType, { total: number, solo: number, duo: number, focus: number }> = {} as any;
    
    data.forEach(session => {
      if (!subjectCounts[session.subject]) {
        subjectCounts[session.subject] = { total: 0, solo: 0, duo: 0, focus: 0 };
      }
      
      subjectCounts[session.subject].total += 1;
      
      // Count by session type
      if (session.session_type === 'Solo') {
        subjectCounts[session.subject].solo += 1;
      } else if (session.session_type === 'Duo') {
        subjectCounts[session.subject].duo += 1;
      } else if (session.session_type === 'Focus') {
        subjectCounts[session.subject].focus += 1;
      }
    });
    
    const chartData = Object.entries(subjectCounts).map(([subject, counts]) => ({
      subject,
      sessions: counts.total,
      solo: counts.solo,
      duo: counts.duo,
      focus: counts.focus
    }));
    
    return {
      chartData
    };
  };
  
  // Get session type distribution
  const fetchSessionTypeDistribution = async (): Promise<SessionTypeData> => {
    const { data, error } = await supabase
      .from('sessions')
      .select('session_type');
      
    if (error) throw error;
    
    const typeCounts: Record<string, number> = {
      'Solo': 0,
      'Duo': 0,
      'Focus': 0
    };
    
    data.forEach(session => {
      typeCounts[session.session_type] += 1;
    });
    
    const chartData = Object.entries(typeCounts).map(([name, value]) => ({
      name,
      value
    }));
    
    return {
      chartData
    };
  };
  
  // Queries
  const attendanceQuery = useQuery({
    queryKey: ['reports', 'attendance', period],
    queryFn: fetchAttendanceData,
  });
  
  const subjectQuery = useQuery({
    queryKey: ['reports', 'subjects'],
    queryFn: fetchSubjectDistribution,
  });
  
  const sessionTypeQuery = useQuery({
    queryKey: ['reports', 'sessionTypes'],
    queryFn: fetchSessionTypeDistribution,
  });
  
  return {
    attendanceData: attendanceQuery.data,
    isLoadingAttendance: attendanceQuery.isLoading,
    attendanceError: attendanceQuery.error,
    
    subjectData: subjectQuery.data,
    isLoadingSubject: subjectQuery.isLoading,
    subjectError: subjectQuery.error,
    
    sessionTypeData: sessionTypeQuery.data,
    isLoadingSessionType: sessionTypeQuery.isLoading,
    sessionTypeError: sessionTypeQuery.error,
    
    refetchReports: () => {
      attendanceQuery.refetch();
      subjectQuery.refetch();
      sessionTypeQuery.refetch();
    }
  };
};
