
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Session, SessionStatus } from "@/lib/types";
import { format, parseISO } from "date-fns";

export type SessionFilters = {
  teacherId?: string;
  studentId?: string;
  status?: SessionStatus[];
  subject?: string;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
  page?: number;
  pageSize?: number;
};

export const useFetchSessions = (filters: SessionFilters = {}) => {
  const pageSize = filters.pageSize || 10;
  const page = filters.page || 1;

  const buildQueryFilters = (query: any) => {
    // Apply filters
    if (filters.teacherId) {
      query = query.eq('teacher_id', filters.teacherId);
    }

    if (filters.studentId) {
      query = query.eq('student_id', filters.studentId);
    }

    if (filters.status && filters.status.length > 0) {
      // Cast the status array to string[] to match what Supabase expects
      const statusValues = filters.status as string[];
      query = query.in('status', statusValues);
    }

    if (filters.subject) {
      query = query.eq('subject', filters.subject);
    }

    if (filters.dateFrom) {
      query = query.gte('date_time', format(filters.dateFrom, "yyyy-MM-dd"));
    }

    if (filters.dateTo) {
      query = query.lte('date_time', format(filters.dateTo, "yyyy-MM-dd"));
    }

    if (filters.search) {
      query = query.or(`notes.ilike.%${filters.search}%,location.ilike.%${filters.search}%`);
    }

    return query;
  };

  return useQuery({
    queryKey: ['sessions', filters],
    queryFn: async () => {
      // Build the base query
      let query = supabase
        .from('sessions')
        .select(`
          *,
          teachers:teacher_id(id, name),
          students:session_students(student_id)
        `);

      // Apply filters
      query = buildQueryFilters(query);

      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      // Get count for pagination
      const { count } = await buildQueryFilters(
        supabase.from('sessions').select('*', { count: 'exact', head: true })
      );

      // Execute the query with pagination
      const { data, error } = await query
        .order('date_time', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('Error fetching sessions:', error);
        throw new Error(error.message);
      }

      // Transform the data to match our Session type
      const sessions = data.map(item => ({
        id: item.id,
        teacherId: item.teacher_id,
        teacherName: item.teachers?.name || 'Unknown',
        studentIds: item.students?.map((s: any) => s.student_id) || [],
        subject: item.subject,
        sessionType: item.session_type,
        location: item.location,
        dateTime: parseISO(item.date_time),
        duration: item.duration,
        status: item.status,
        notes: item.notes,
        packId: item.pack_id,
        rescheduleCount: item.reschedule_count,
        createdAt: parseISO(item.created_at),
        updatedAt: parseISO(item.updated_at),
        recurrenceRule: item.recurrence_rule,
        originalSessionId: item.original_session_id,
        rescheduledFrom: item.rescheduled_from
      }));

      return {
        sessions,
        pagination: {
          page,
          pageSize,
          totalCount: count || 0,
          totalPages: Math.ceil((count || 0) / pageSize),
        }
      };
    },
    enabled: true,
  });
};
