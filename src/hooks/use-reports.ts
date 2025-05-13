
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FilterOptions } from '@/lib/types';
import { format, subDays, eachDayOfInterval, parseISO } from 'date-fns';
import { SubjectType, AttendanceStatus } from '@/lib/types';

export const useReports = (filters: FilterOptions = {}) => {
  // For attendance trends
  const { data: attendanceData, isLoading: attendanceLoading } = useQuery({
    queryKey: ['reports', 'attendance', filters],
    queryFn: async () => {
      const startDate = filters.startDate || subDays(new Date(), 30);
      const endDate = filters.endDate || new Date();
      
      // Build query for attendance data
      let query = supabase
        .from('sessions')
        .select('date_time, status, id')
        .gte('date_time', startDate.toISOString())
        .lte('date_time', endDate.toISOString());
      
      if (filters.subjects && filters.subjects.length > 0) {
        query = query.in('subject', filters.subjects as SubjectType[]);
      }
      
      if (filters.status && filters.status.length > 0) {
        query = query.in('status', filters.status as AttendanceStatus[]);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Calculate attendance rate
      const totalSessions = data.length;
      const presentSessions = data.filter(session => session.status === 'Present').length;
      const attendanceRate = totalSessions > 0 ? Math.round((presentSessions / totalSessions) * 100) : 0;
      
      // Prepare daily attendance data for chart
      const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
      const dailyAttendance = dateRange.map(day => {
        const dayStr = format(day, 'yyyy-MM-dd');
        const daySessions = data.filter(session => 
          format(parseISO(session.date_time), 'yyyy-MM-dd') === dayStr
        );
        
        const total = daySessions.length;
        const present = daySessions.filter(session => session.status === 'Present').length;
        const cancelledByStudent = daySessions.filter(session => session.status === 'Cancelled by Student').length;
        const cancelledByTeacher = daySessions.filter(session => session.status === 'Cancelled by Teacher').length;
        const cancelledBySchool = daySessions.filter(session => session.status === 'Cancelled by School').length;
        
        return {
          date: dayStr,
          total,
          present,
          cancelledByStudent,
          cancelledByTeacher,
          cancelledBySchool
        };
      });
      
      // Prepare chart data
      const chartData = {
        labels: dailyAttendance.map(day => format(parseISO(day.date), 'MMM d')),
        datasets: [
          {
            label: 'Present',
            data: dailyAttendance.map(day => day.present),
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
          },
          {
            label: 'Cancelled by Student',
            data: dailyAttendance.map(day => day.cancelledByStudent),
            borderColor: 'rgb(255, 205, 86)',
            backgroundColor: 'rgba(255, 205, 86, 0.5)',
          },
          {
            label: 'Cancelled by Teacher',
            data: dailyAttendance.map(day => day.cancelledByTeacher),
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
          },
          {
            label: 'Cancelled by School',
            data: dailyAttendance.map(day => day.cancelledBySchool),
            borderColor: 'rgb(201, 203, 207)',
            backgroundColor: 'rgba(201, 203, 207, 0.5)',
          }
        ]
      };
      
      return {
        totalSessions,
        presentSessions,
        attendanceRate,
        chartData
      };
    }
  });
  
  // For sessions by instrument
  const { data: sessionsData, isLoading: sessionsLoading } = useQuery({
    queryKey: ['reports', 'sessions', filters],
    queryFn: async () => {
      const startDate = filters.startDate || subDays(new Date(), 30);
      const endDate = filters.endDate || new Date();
      
      // Build query for sessions data
      let query = supabase
        .from('sessions')
        .select('subject, session_type, id')
        .gte('date_time', startDate.toISOString())
        .lte('date_time', endDate.toISOString());
      
      if (filters.subjects && filters.subjects.length > 0) {
        query = query.in('subject', filters.subjects as SubjectType[]);
      }
      
      if (filters.status && filters.status.length > 0) {
        query = query.in('status', filters.status as AttendanceStatus[]);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Count sessions by instrument
      const sessionsByInstrument = data.reduce((acc: any, session) => {
        if (!acc[session.subject]) {
          acc[session.subject] = {
            total: 0,
            Solo: 0,
            Duo: 0,
            Focus: 0
          };
        }
        acc[session.subject].total++;
        acc[session.subject][session.session_type]++;
        return acc;
      }, {});
      
      // Overall totals
      const totalSessions = data.length;
      const soloSessions = data.filter(session => session.session_type === 'Solo').length;
      const duoSessions = data.filter(session => session.session_type === 'Duo').length;
      const focusSessions = data.filter(session => session.session_type === 'Focus').length;
      
      // Prepare chart data
      const instruments = Object.keys(sessionsByInstrument);
      const chartData = {
        labels: instruments,
        datasets: [
          {
            label: 'Solo',
            data: instruments.map(instrument => sessionsByInstrument[instrument].Solo),
            backgroundColor: 'rgba(75, 192, 192, 0.7)',
          },
          {
            label: 'Duo',
            data: instruments.map(instrument => sessionsByInstrument[instrument].Duo),
            backgroundColor: 'rgba(255, 205, 86, 0.7)',
          },
          {
            label: 'Focus',
            data: instruments.map(instrument => sessionsByInstrument[instrument].Focus),
            backgroundColor: 'rgba(255, 99, 132, 0.7)',
          }
        ]
      };
      
      return {
        totalSessions,
        soloSessions,
        duoSessions,
        focusSessions,
        sessionsByInstrument,
        chartData
      };
    }
  });
  
  // For student progress data
  const { data: studentProgressData, isLoading: progressLoading } = useQuery({
    queryKey: ['reports', 'student-progress'],
    queryFn: async () => {
      // Get data about student enrollments and pack purchases
      // This will be implemented with actual data once we have these tables
      
      // For now, generate placeholder data
      const activeStudents = 15;
      const completedCourses = 8;
      const inProgressCourses = 12;
      const notStartedCourses = 5;
      
      // Prepare chart data
      const chartData = {
        labels: ['Completed', 'In Progress', 'Not Started'],
        datasets: [
          {
            data: [completedCourses, inProgressCourses, notStartedCourses],
            backgroundColor: [
              'rgba(75, 192, 192, 0.7)',
              'rgba(255, 205, 86, 0.7)',
              'rgba(201, 203, 207, 0.7)'
            ]
          }
        ]
      };
      
      return {
        activeStudents,
        completedCourses,
        inProgressCourses,
        notStartedCourses,
        chartData
      };
    }
  });
  
  const isLoading = attendanceLoading || sessionsLoading || progressLoading;
  
  return {
    attendanceData,
    sessionsData,
    studentProgressData,
    isLoading
  };
};
