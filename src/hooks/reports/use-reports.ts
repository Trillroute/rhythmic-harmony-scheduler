
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  AttendanceData, 
  SubjectDistributionData, 
  SessionTypeData, 
  SessionsReportData,
  StudentProgressData,
  ReportPeriod
} from './types';
import { getDateRangeFromPeriod } from './date-utils';

export const useReports = (period: ReportPeriod = 'month') => {
  const { startDate, endDate } = getDateRangeFromPeriod(period);

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

      // Process the data to generate reports
      const total = attendanceData?.length || 0;
      const present = attendanceData?.filter(s => s.status === 'Present').length || 0;
      const absent = attendanceData?.filter(s => s.status === 'Absent').length || 0;
      const cancelled = attendanceData?.filter(s => s.status.includes('Cancelled')).length || 0;
      const noShow = attendanceData?.filter(s => s.status === 'No Show').length || 0;
      
      // Create attendance distribution data for chart
      const distribution = [
        { status: 'Present', count: present },
        { status: 'Absent', count: absent },
        { status: 'Cancelled', count: cancelled },
        { status: 'No Show', count: noShow }
      ];
      
      // Create time series data (grouped by date)
      const dateMap = new Map();
      if (attendanceData) {
        attendanceData.forEach(session => {
          const dateStr = new Date(session.date_time).toISOString().split('T')[0];
          if (!dateMap.has(dateStr)) {
            dateMap.set(dateStr, { present: 0, total: 0 });
          }
          dateMap.get(dateStr).total += 1;
          if (session.status === 'Present') {
            dateMap.get(dateStr).present += 1;
          }
        });
      }
      
      const attendanceChartData = Array.from(dateMap).map(([date, data]) => ({
        date,
        present: data.present,
        total: data.total
      }));
      
      // Process subject distribution
      const subjectCounts = new Map();
      if (attendanceData) {
        attendanceData.forEach(session => {
          const subject = session.subject;
          subjectCounts.set(subject, (subjectCounts.get(subject) || 0) + 1);
        });
      }
      
      const subjectDistribution = Array.from(subjectCounts).map(([name, value]) => ({ name, value }));
      
      // Process session types
      const typeCounts = new Map();
      if (attendanceData) {
        attendanceData.forEach(session => {
          const key = `${session.session_type}-${session.subject}`;
          typeCounts.set(key, {
            type: session.session_type,
            subject: session.subject,
            count: (typeCounts.get(key)?.count || 0) + 1
          });
        });
      }
      
      const sessionTypeData = Array.from(typeCounts.values());
      
      // Group sessions by date or month depending on range
      const isLongRange = (endDate.getTime() - startDate.getTime()) > (30 * 24 * 60 * 60 * 1000);
      
      const groupedSessions = new Map();
      if (attendanceData) {
        attendanceData.forEach(session => {
          const date = new Date(session.date_time);
          let key;
          
          if (isLongRange) {
            // Group by month for longer ranges
            key = `${date.getFullYear()}-${date.getMonth() + 1}`;
          } else {
            // Group by date for shorter ranges
            key = date.toISOString().split('T')[0];
          }
          
          groupedSessions.set(key, (groupedSessions.get(key) || 0) + 1);
        });
      }
      
      const sessionsOverTime = Array.from(groupedSessions).map(([date, count]) => {
        // Format date label
        let formattedDate = date;
        if (isLongRange) {
          const [year, month] = date.split('-');
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          formattedDate = monthNames[parseInt(month) - 1];
        }
        
        return { date: formattedDate, count };
      }).sort((a, b) => a.date.localeCompare(b.date));
      
      // Process student progress
      const studentProgress = progressData ? progressData.map(item => {
        return {
          id: item.id,
          studentName: item.enrollment?.profiles?.name || 'Unknown Student',
          courseName: item.enrollment?.courses?.name || 'Unknown Course',
          instrument: item.enrollment?.courses?.instrument || 'Unknown',
          completionPercentage: item.completion_percentage || 0
        };
      }) : [];

      return {
        attendanceData: {
          total,
          present,
          absent,
          cancelled,
          noShow,
          distribution,
          chartData: attendanceChartData
        },
        subjectDistribution,
        sessionTypeData,
        sessionsOverTime,
        studentProgress,
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

  return {
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
    refetch
  };
};
