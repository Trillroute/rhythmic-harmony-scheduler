
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subMonths } from "date-fns";
import { SubjectType, AttendanceStatus } from "@/lib/types";

export interface ReportFilter {
  startDate?: Date;
  endDate?: Date;
  subjects?: SubjectType[];
  status?: AttendanceStatus[];
  teacherId?: string;
  studentId?: string;
}

export const useAttendanceReport = (filters: ReportFilter = {}) => {
  const { startDate = subMonths(new Date(), 3), endDate = new Date() } = filters;
  
  return useQuery({
    queryKey: ['attendance-report', filters],
    queryFn: async () => {
      // Format dates for Supabase
      const formattedStartDate = format(startDate, "yyyy-MM-dd");
      const formattedEndDate = format(endDate, "yyyy-MM-dd");
      
      // Get all attendance events
      let query = supabase
        .from('attendance_events')
        .select(`
          id,
          status,
          marked_at,
          sessions!inner(
            id,
            teacher_id,
            subject,
            date_time,
            session_students(student_id)
          )
        `)
        .gte('marked_at', formattedStartDate)
        .lte('marked_at', formattedEndDate);
      
      if (filters.subjects && filters.subjects.length > 0) {
        query = query.in('sessions.subject', filters.subjects as SubjectType[]);
      }
      
      if (filters.status && filters.status.length > 0) {
        query = query.in('status', filters.status as AttendanceStatus[]);
      }
      
      if (filters.teacherId) {
        query = query.eq('sessions.teacher_id', filters.teacherId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Process data for student attendance
      const studentAttendance: Record<string, { total: number; present: number }> = {};
      const teacherAttendance: Record<string, { total: number; present: number }> = {};
      
      data.forEach(event => {
        const teacherId = event.sessions.teacher_id;
        
        // Initialize teacher record if not exists
        if (!teacherAttendance[teacherId]) {
          teacherAttendance[teacherId] = { total: 0, present: 0 };
        }
        
        teacherAttendance[teacherId].total += 1;
        if (event.status === 'Present') {
          teacherAttendance[teacherId].present += 1;
        }
        
        // Process student attendance
        event.sessions.session_students.forEach((student: any) => {
          const studentId = student.student_id;
          
          if (filters.studentId && studentId !== filters.studentId) {
            return;
          }
          
          if (!studentAttendance[studentId]) {
            studentAttendance[studentId] = { total: 0, present: 0 };
          }
          
          studentAttendance[studentId].total += 1;
          if (event.status === 'Present') {
            studentAttendance[studentId].present += 1;
          }
        });
      });
      
      // Calculate percentages
      const studentAttendancePercentage = Object.entries(studentAttendance).map(([id, stats]) => ({
        id,
        total: stats.total,
        present: stats.present,
        percentage: Math.round((stats.present / stats.total) * 100) || 0
      }));
      
      const teacherAttendancePercentage = Object.entries(teacherAttendance).map(([id, stats]) => ({
        id,
        total: stats.total,
        present: stats.present,
        percentage: Math.round((stats.present / stats.total) * 100) || 0
      }));
      
      // Sort by percentage (ascending)
      studentAttendancePercentage.sort((a, b) => a.percentage - b.percentage);
      teacherAttendancePercentage.sort((a, b) => b.percentage - a.percentage);
      
      return {
        studentAttendance: studentAttendancePercentage,
        teacherAttendance: teacherAttendancePercentage,
        totalSessions: data.length,
        rawData: data
      };
    }
  });
};

export const useSessionReport = (filters: ReportFilter = {}) => {
  const { startDate = subMonths(new Date(), 3), endDate = new Date() } = filters;
  
  return useQuery({
    queryKey: ['session-report', filters],
    queryFn: async () => {
      // Format dates for Supabase
      const formattedStartDate = format(startDate, "yyyy-MM-dd");
      const formattedEndDate = format(endDate, "yyyy-MM-dd");
      
      // Get all sessions
      let query = supabase
        .from('sessions')
        .select(`
          id,
          teacher_id,
          subject,
          session_type,
          location,
          date_time,
          status,
          reschedule_count
        `)
        .gte('date_time', formattedStartDate)
        .lte('date_time', formattedEndDate);
      
      if (filters.subjects && filters.subjects.length > 0) {
        query = query.in('subject', filters.subjects as SubjectType[]);
      }
      
      if (filters.status && filters.status.length > 0) {
        query = query.in('status', filters.status as AttendanceStatus[]);
      }
      
      if (filters.teacherId) {
        query = query.eq('teacher_id', filters.teacherId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Process data for session stats
      const sessionsByTeacher: Record<string, number> = {};
      const sessionsByStatus: Record<string, number> = {};
      const sessionsBySubject: Record<string, number> = {};
      let totalRescheduled = 0;
      
      data.forEach(session => {
        // Count by teacher
        const teacherId = session.teacher_id;
        sessionsByTeacher[teacherId] = (sessionsByTeacher[teacherId] || 0) + 1;
        
        // Count by status
        const status = session.status;
        sessionsByStatus[status] = (sessionsByStatus[status] || 0) + 1;
        
        // Count by subject
        const subject = session.subject;
        sessionsBySubject[subject] = (sessionsBySubject[subject] || 0) + 1;
        
        // Count rescheduled sessions
        if (session.reschedule_count > 0) {
          totalRescheduled += 1;
        }
      });
      
      // Format for charts
      const teacherChartData = Object.entries(sessionsByTeacher).map(([id, count]) => ({
        id,
        count
      }));
      
      const statusChartData = Object.entries(sessionsByStatus).map(([status, count]) => ({
        status,
        count
      }));
      
      const subjectChartData = Object.entries(sessionsBySubject).map(([subject, count]) => ({
        subject,
        count
      }));
      
      return {
        sessionsByTeacher: teacherChartData,
        sessionsByStatus: statusChartData,
        sessionsBySubject: subjectChartData,
        totalSessions: data.length,
        totalRescheduled,
        rawData: data
      };
    }
  });
};

export const usePackReport = (filters: ReportFilter = {}) => {
  return useQuery({
    queryKey: ['pack-report', filters],
    queryFn: async () => {
      // Get all active packs
      let query = supabase
        .from('session_packs')
        .select(`
          id,
          student_id,
          size,
          subject,
          session_type,
          location,
          purchased_date,
          expiry_date,
          remaining_sessions,
          is_active,
          weekly_frequency
        `);
      
      // Apply any filters
      if (filters.subjects && filters.subjects.length > 0) {
        query = query.in('subject', filters.subjects as SubjectType[]);
      }
      
      if (filters.studentId) {
        query = query.eq('student_id', filters.studentId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Process data for pack stats
      const packsBySize: Record<string, number> = {};
      const packsBySubject: Record<string, number> = {};
      const packsByStudent: Record<string, { total: number; used: number; remaining: number }> = {};
      
      let totalRevenue = 0;
      let totalSessions = 0;
      let totalRemaining = 0;
      let totalUsed = 0;
      
      // Get pack pricing from settings
      const { data: settings } = await supabase
        .from('system_settings')
        .select('*')
        .eq('key', 'pack_sizes')
        .single();
      
      const packPricing = settings?.value || {};
      
      // Process each pack
      data.forEach(pack => {
        // Count by size
        const size = pack.size;
        packsBySize[size] = (packsBySize[size] || 0) + 1;
        
        // Count by subject
        const subject = pack.subject;
        packsBySubject[subject] = (packsBySubject[subject] || 0) + 1;
        
        // Calculate used sessions
        const used = parseInt(pack.size) - pack.remaining_sessions;
        
        // Count by student
        const studentId = pack.student_id;
        if (!packsByStudent[studentId]) {
          packsByStudent[studentId] = { total: 0, used: 0, remaining: 0 };
        }
        packsByStudent[studentId].total += 1;
        packsByStudent[studentId].used += used;
        packsByStudent[studentId].remaining += pack.remaining_sessions;
        
        // Update totals
        totalSessions += parseInt(pack.size);
        totalRemaining += pack.remaining_sessions;
        totalUsed += used;
        
        // Calculate revenue based on pack size and pricing
        if (packPricing[pack.size]) {
          totalRevenue += packPricing[pack.size];
        }
      });
      
      // Format for charts
      const sizeChartData = Object.entries(packsBySize).map(([size, count]) => ({
        size,
        count
      }));
      
      const subjectChartData = Object.entries(packsBySubject).map(([subject, count]) => ({
        subject,
        count
      }));
      
      // Find soon-to-expire packs (within the next month)
      const today = new Date();
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      
      const expiringPacks = data.filter(pack => {
        if (!pack.expiry_date) return false;
        const expiryDate = new Date(pack.expiry_date);
        return expiryDate > today && expiryDate < nextMonth;
      });
      
      return {
        packsBySize: sizeChartData,
        packsBySubject: subjectChartData,
        packsByStudent: Object.entries(packsByStudent).map(([id, stats]) => ({
          id,
          ...stats
        })),
        totalPacks: data.length,
        totalSessions,
        totalRemaining,
        totalUsed,
        usagePercentage: Math.round((totalUsed / totalSessions) * 100) || 0,
        estimatedRevenue: totalRevenue,
        expiringPacks,
        rawData: data
      };
    }
  });
};
