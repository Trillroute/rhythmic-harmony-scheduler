
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, subMonths, subDays, parseISO } from 'date-fns';
import { FilterOptions } from '@/lib/types';

// Helper function to format dates
const formatDate = (date: Date | string) => {
  if (typeof date === 'string') {
    return format(parseISO(date), 'yyyy-MM-dd');
  }
  return format(date, 'yyyy-MM-dd');
};

interface ChartDataPoint {
  date: string;
  total: number;
  present: number;
  rate: number;
}

interface SubjectDataPoint {
  subject: string;
  sessions: number;
  solo: number;
  duo: number;
  focus: number;
}

interface PackDataPoint {
  name: string;
  value: number;
}

interface AttendanceReportData {
  chartData: ChartDataPoint[];
  attendanceRate: number;
  totalSessions: number;
  presentSessions: number;
}

interface SessionsReportData {
  chartData: SubjectDataPoint[];
  totalSessions: number;
  bySubject: Record<string, number>;
}

interface StudentProgressData {
  chartData: PackDataPoint[];
  activeStudents: number;
  completionRate: number;
}

// Fetch attendance data for reporting
export const useAttendanceData = (options?: FilterOptions) => {
  const startDate = options?.startDate || subMonths(new Date(), 3);
  const endDate = options?.endDate || new Date();
  
  return useQuery({
    queryKey: ['attendanceData', options],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sessions')
        .select('date_time, status')
        .gte('date_time', formatDate(startDate))
        .lte('date_time', formatDate(endDate));

      if (error) throw error;

      // Transform data for chart display
      const attendanceByDate = data.reduce((acc: { [key: string]: { total: number; present: number } }, session) => {
        const date = formatDate(session.date_time);
        if (!acc[date]) {
          acc[date] = { total: 0, present: 0 };
        }
        acc[date].total += 1;
        if (session.status === 'Present') {
          acc[date].present += 1;
        }
        return acc;
      }, {});

      // Convert to array format for charting
      const chartData = Object.entries(attendanceByDate).map(([date, counts]) => ({
        date,
        total: counts.total,
        present: counts.present,
        rate: counts.total > 0 ? Math.round((counts.present / counts.total) * 100) / 100 : 0,
      }));
      
      // Calculate overall attendance rate
      const totalSessions = chartData.reduce((sum, item) => sum + item.total, 0);
      const presentSessions = chartData.reduce((sum, item) => sum + item.present, 0);
      const attendanceRate = totalSessions > 0 ? Math.round((presentSessions / totalSessions) * 100) : 0;
      
      return {
        chartData,
        attendanceRate,
        totalSessions,
        presentSessions
      };
    },
  });
};

// Fetch session distribution by subject
export const useSessionsBySubject = (options?: FilterOptions) => {
  return useQuery({
    queryKey: ['sessionsBySubject', options],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sessions')
        .select('subject, session_type')
        .gte('date_time', formatDate(subMonths(new Date(), 6)));

      if (error) throw error;

      // Transform data for chart display
      const subjectStats = data.reduce((acc: { [key: string]: { sessions: number; solo: number; duo: number; focus: number } }, session) => {
        const subject = session.subject;
        if (!acc[subject]) {
          acc[subject] = { sessions: 0, solo: 0, duo: 0, focus: 0 };
        }
        acc[subject].sessions += 1;
        
        // Count by session type
        if (session.session_type === 'Solo') {
          acc[subject].solo += 1;
        } else if (session.session_type === 'Duo') {
          acc[subject].duo += 1;
        } else if (session.session_type === 'Focus') {
          acc[subject].focus += 1;
        }
        
        return acc;
      }, {});

      // Convert to array format for charting
      const chartData = Object.entries(subjectStats).map(([subject, stats]) => ({
        subject,
        sessions: stats.sessions,
        solo: stats.solo,
        duo: stats.duo,
        focus: stats.focus,
      }));
      
      // Calculate totals
      const totalSessions = chartData.reduce((sum, item) => sum + item.sessions, 0);
      
      // Create by-subject breakdown
      const bySubject: Record<string, number> = {};
      chartData.forEach(item => {
        bySubject[item.subject] = item.sessions;
      });
      
      return {
        chartData,
        totalSessions,
        bySubject
      };
    },
  });
};

// Fetch pack distribution data
export const usePackDistribution = () => {
  return useQuery({
    queryKey: ['packDistribution'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('session_packs')
        .select('size, count')
        .order('purchased_date', { ascending: false });

      if (error) throw error;

      // Count packs by size
      const packCounts = data.reduce((acc: { [key: string]: number }, pack) => {
        const size = pack.size.toString();
        if (!acc[size]) {
          acc[size] = 0;
        }
        acc[size] += 1;
        return acc;
      }, {});

      // Format for pie chart
      const chartData = Object.entries(packCounts).map(([name, value]) => ({
        name: `${name} Sessions`,
        value,
      }));
      
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('id');
        
      if (studentError) throw studentError;
      
      return {
        chartData,
        activeStudents: studentData?.length || 0,
        completionRate: 65 // Placeholder - would need actual completion data
      };
    },
  });
};

// Export a combined reports hook for the dashboard
export const useReports = (options?: FilterOptions) => {
  const attendance = useAttendanceData(options);
  const sessions = useSessionsBySubject(options);
  const studentProgress = usePackDistribution();
  
  return {
    attendanceData: attendance.data || { 
      chartData: [], 
      attendanceRate: 0, 
      totalSessions: 0, 
      presentSessions: 0 
    },
    sessionsData: sessions.data || { 
      chartData: [], 
      totalSessions: 0, 
      bySubject: {} 
    },
    studentProgressData: studentProgress.data || { 
      chartData: [], 
      activeStudents: 0, 
      completionRate: 0 
    },
    isLoadingAttendance: attendance.isLoading,
    errorAttendance: attendance.error,
    isLoadingSubjects: sessions.isLoading,
    errorSubjects: sessions.error,
    isLoadingPacks: studentProgress.isLoading,
    errorPacks: studentProgress.error,
    isLoading: attendance.isLoading || sessions.isLoading || studentProgress.isLoading,
    isError: !!attendance.error || !!sessions.error || !!studentProgress.error
  };
};
