
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FilterOptions, AttendanceStatus, SubjectType } from "@/lib/types";
import { format } from "date-fns";

// Add proper type for the attendance report data
export interface AttendanceReportData {
  id: string;
  sessionId: string;
  status: AttendanceStatus;
  markedAt: string;
  teacherId: string;
  teacherName: string;
  subject: SubjectType;
  sessionType: string;
  location: string;
  dateTime: string;
  duration: number;
  formattedDate: string;
  formattedTime: string;
}

// Add proper type for the teacher utilization report data
export interface TeacherUtilizationData {
  teacherId: string;
  teacherName: string;
  maxWeeklySessions: number;
  completedSessions: number;
  cancelledSessions: number;
  totalSessions: number;
  completionRate: number;
  cancellationRate: number;
  utilization: number;
}

export const useAttendanceReport = (filter: FilterOptions = {}) => {
  return useQuery({
    queryKey: ['attendance-report', filter],
    queryFn: async () => {
      // Start with the base query
      let query = supabase
        .from('attendance_events')
        .select(`
          *,
          sessions!inner (
            id,
            subject,
            session_type,
            location,
            date_time,
            duration,
            teacher_id,
            teachers!inner (
              profiles!inner (
                name
              )
            )
          )
        `)
        .order('created_at', { ascending: false });
      
      // Apply filters
      if (filter.teacherId) {
        query = query.eq('sessions.teacher_id', filter.teacherId);
      }
      
      if (filter.subject) {
        query = query.eq('sessions.subject', filter.subject);
      }
      
      if (filter.sessionType) {
        query = query.eq('sessions.session_type', filter.sessionType);
      }
      
      if (filter.location) {
        query = query.eq('sessions.location', filter.location);
      }
      
      if (filter.startDate) {
        const startDateStr = typeof filter.startDate === 'string' 
          ? filter.startDate 
          : filter.startDate.toISOString();
        query = query.gte('sessions.date_time', startDateStr);
      }
      
      if (filter.endDate) {
        const endDateStr = typeof filter.endDate === 'string' 
          ? filter.endDate 
          : filter.endDate.toISOString();
        query = query.lte('sessions.date_time', endDateStr);
      }
      
      if (filter.status) {
        if (Array.isArray(filter.status)) {
          // Ensure we only use valid status values
          const validStatuses = filter.status.filter(
            status => ["Present", "Scheduled", "Cancelled by Student", "Cancelled by Teacher", "Cancelled by School"].includes(status)
          );
          if (validStatuses.length > 0) {
            query = query.in('status', validStatuses);
          }
        } else if (["Present", "Scheduled", "Cancelled by Student", "Cancelled by Teacher", "Cancelled by School"].includes(filter.status)) {
          query = query.eq('status', filter.status);
        }
      }
      
      // Execute the query
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      // Transform the data for the report
      const reportData = data.map(item => ({
        id: item.id,
        sessionId: item.session_id,
        status: item.status as AttendanceStatus,
        markedAt: item.marked_at,
        teacherId: item.sessions.teacher_id,
        teacherName: item.sessions.teachers.profiles.name,
        subject: item.sessions.subject,
        sessionType: item.sessions.session_type,
        location: item.sessions.location,
        dateTime: item.sessions.date_time,
        duration: item.sessions.duration,
        formattedDate: format(new Date(item.sessions.date_time), 'PPP'),
        formattedTime: format(new Date(item.sessions.date_time), 'p')
      }));
      
      return reportData;
    }
  });
};

export const useTeacherUtilizationReport = (filter: FilterOptions = {}) => {
  return useQuery({
    queryKey: ['teacher-utilization-report', filter],
    queryFn: async () => {
      // First get all teachers
      const { data: teachers, error: teachersError } = await supabase
        .from('teachers')
        .select(`
          id,
          profiles!inner (
            name
          ),
          max_weekly_sessions
        `);
      
      if (teachersError) {
        throw teachersError;
      }
      
      // For each teacher, calculate their utilization
      const startDate = filter.startDate 
        ? typeof filter.startDate === 'string' ? new Date(filter.startDate) : filter.startDate
        : new Date(new Date().setDate(new Date().getDate() - 30)); // Default to last 30 days
        
      const endDate = filter.endDate
        ? typeof filter.endDate === 'string' ? new Date(filter.endDate) : filter.endDate
        : new Date(); // Default to today
      
      const utilizationPromises = teachers.map(async (teacher) => {
        // Count completed sessions
        const { count: completedCount, error: completedError } = await supabase
          .from('sessions')
          .select('*', { count: 'exact' })
          .eq('teacher_id', teacher.id)
          .eq('status', 'Present')
          .gte('date_time', startDate.toISOString())
          .lte('date_time', endDate.toISOString());
        
        if (completedError) {
          throw completedError;
        }
        
        // Count cancelled sessions (by teacher)
        const { count: cancelledCount, error: cancelledError } = await supabase
          .from('sessions')
          .select('*', { count: 'exact' })
          .eq('teacher_id', teacher.id)
          .eq('status', 'Cancelled by Teacher')
          .gte('date_time', startDate.toISOString())
          .lte('date_time', endDate.toISOString());
        
        if (cancelledError) {
          throw cancelledError;
        }
        
        // Count total scheduled sessions
        const { count: totalCount, error: totalError } = await supabase
          .from('sessions')
          .select('*', { count: 'exact' })
          .eq('teacher_id', teacher.id)
          .in('status', ['Present', 'Scheduled', 'Cancelled by Teacher', 'Cancelled by Student', 'Cancelled by School'])
          .gte('date_time', startDate.toISOString())
          .lte('date_time', endDate.toISOString());
        
        if (totalError) {
          throw totalError;
        }
        
        // Calculate utilization metrics
        const completionRate = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
        const cancellationRate = totalCount > 0 ? (cancelledCount / totalCount) * 100 : 0;
        
        return {
          teacherId: teacher.id,
          teacherName: teacher.profiles.name,
          maxWeeklySessions: teacher.max_weekly_sessions || 0,
          completedSessions: completedCount || 0,
          cancelledSessions: cancelledCount || 0,
          totalSessions: totalCount || 0,
          completionRate,
          cancellationRate,
          utilization: teacher.max_weekly_sessions 
            ? (totalCount / (teacher.max_weekly_sessions * 4)) * 100 // Assuming 4 weeks
            : 0
        };
      });
      
      const utilizationData = await Promise.all(utilizationPromises);
      
      return utilizationData;
    }
  });
};

// Create the useReports hook that combines data from different reports
export const useReports = (filter: FilterOptions = {}) => {
  const attendanceQuery = useAttendanceReport(filter);
  const teacherUtilizationQuery = useTeacherUtilizationReport(filter);
  
  const isLoading = attendanceQuery.isLoading || teacherUtilizationQuery.isLoading;
  const error = attendanceQuery.error || teacherUtilizationQuery.error;
  
  // Process attendance data for charts
  const attendanceData = React.useMemo(() => {
    if (!attendanceQuery.data) return null;
    
    const statusCounts: Record<string, number> = {};
    const dailyCounts: Record<string, { total: number, present: number }> = {};
    
    attendanceQuery.data.forEach(entry => {
      // Count by status
      statusCounts[entry.status] = (statusCounts[entry.status] || 0) + 1;
      
      // Count by date
      const day = entry.formattedDate;
      if (!dailyCounts[day]) {
        dailyCounts[day] = { total: 0, present: 0 };
      }
      dailyCounts[day].total += 1;
      if (entry.status === 'Present') {
        dailyCounts[day].present += 1;
      }
    });
    
    // Calculate attendance rate
    const totalSessions = attendanceQuery.data.length || 0;
    const presentSessions = statusCounts['Present'] || 0;
    const attendanceRate = totalSessions > 0 ? Math.round((presentSessions / totalSessions) * 100) : 0;
    
    // Format data for chart
    const chartData = Object.entries(dailyCounts).map(([date, counts]) => ({
      date,
      total: counts.total,
      present: counts.present,
      rate: counts.total > 0 ? (counts.present / counts.total) * 100 : 0
    }));
    
    // Sort by date
    chartData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return {
      statusCounts,
      attendanceRate,
      chartData
    };
  }, [attendanceQuery.data]);
  
  // Process sessions data for charts
  const sessionsData = React.useMemo(() => {
    if (!attendanceQuery.data) return null;
    
    const subjectCounts: Record<string, number> = {};
    const typesCounts: Record<string, number> = {};
    
    attendanceQuery.data.forEach(entry => {
      // Count by subject
      subjectCounts[entry.subject] = (subjectCounts[entry.subject] || 0) + 1;
      
      // Count by session type
      typesCounts[entry.sessionType] = (typesCounts[entry.sessionType] || 0) + 1;
    });
    
    // Format data for chart
    const chartData = Object.keys(subjectCounts).map(subject => ({
      subject,
      sessions: subjectCounts[subject],
      solo: attendanceQuery.data.filter(e => e.subject === subject && e.sessionType === 'Solo').length,
      duo: attendanceQuery.data.filter(e => e.subject === subject && e.sessionType === 'Duo').length,
      focus: attendanceQuery.data.filter(e => e.subject === subject && e.sessionType === 'Focus').length,
    }));
    
    return {
      totalSessions: attendanceQuery.data.length,
      subjectCounts,
      typesCounts,
      chartData
    };
  }, [attendanceQuery.data]);
  
  // Process student progress data
  const studentProgressData = React.useMemo(() => {
    // Simulated data - in a real app, this would come from another query
    return {
      activeStudents: 42,
      completionRates: [
        { name: "Beginner", value: 65 },
        { name: "Intermediate", value: 25 },
        { name: "Advanced", value: 10 }
      ],
      chartData: [
        { name: "Beginner", value: 65 },
        { name: "Intermediate", value: 25 },
        { name: "Advanced", value: 10 }
      ]
    };
  }, []);
  
  return {
    attendanceData,
    sessionsData,
    studentProgressData,
    isLoading,
    error
  };
};
