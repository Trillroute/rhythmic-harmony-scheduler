
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, subMonths, subDays, parseISO } from 'date-fns';

// Helper function to format dates
const formatDate = (date: Date | string) => {
  if (typeof date === 'string') {
    return format(parseISO(date), 'yyyy-MM-dd');
  }
  return format(date, 'yyyy-MM-dd');
};

// Fetch attendance data for reporting
export const useAttendanceData = (dateRange: { start: Date; end: Date } = {
  start: subMonths(new Date(), 3),
  end: new Date(),
}) => {
  return useQuery({
    queryKey: ['attendanceData', dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sessions')
        .select('date_time, status')
        .gte('date_time', formatDate(dateRange.start))
        .lte('date_time', formatDate(dateRange.end));

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
      return Object.entries(attendanceByDate).map(([date, counts]) => ({
        date,
        total: counts.total,
        present: counts.present,
        rate: counts.total > 0 ? Math.round((counts.present / counts.total) * 100) / 100 : 0,
      }));
    },
  });
};

// Fetch session distribution by subject
export const useSessionsBySubject = () => {
  return useQuery({
    queryKey: ['sessionsBySubject'],
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
      return Object.entries(subjectStats).map(([subject, stats]) => ({
        subject,
        sessions: stats.sessions,
        solo: stats.solo,
        duo: stats.duo,
        focus: stats.focus,
      }));
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
      return Object.entries(packCounts).map(([name, value]) => ({
        name: `${name} Sessions`,
        value,
      }));
    },
  });
};

// Export a combined reports hook for the dashboard
export const useReports = () => {
  const attendance = useAttendanceData();
  const sessionsBySubject = useSessionsBySubject();
  const packDistribution = usePackDistribution();
  
  return {
    attendanceData: attendance.data || [],
    isLoadingAttendance: attendance.isLoading,
    errorAttendance: attendance.error,
    
    subjectData: sessionsBySubject.data || [],
    isLoadingSubjects: sessionsBySubject.isLoading,
    errorSubjects: sessionsBySubject.error,
    
    packData: packDistribution.data || [],
    isLoadingPacks: packDistribution.isLoading,
    errorPacks: packDistribution.error,
    
    isLoading: attendance.isLoading || sessionsBySubject.isLoading || packDistribution.isLoading,
    isError: !!attendance.error || !!sessionsBySubject.error || !!packDistribution.error
  };
};
