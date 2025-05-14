
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AttendanceStatus } from '@/lib/types';
import { transformSessionWithStudents } from './session-transformers';
import { SessionsProps, PaginationState } from './types';
import { assertAttendanceStatusArray, assertStringArray } from '@/lib/type-utils';

export const useFetchSessions = (props: SessionsProps) => {
  const { 
    fromDate, 
    toDate, 
    teacherId, 
    studentId, 
    status, 
    pageSize = 10, 
    page = 1 
  } = props;

  const fetchSessions = async () => {
    let query = supabase
      .from('sessions')
      .select(`
        *,
        profiles:teacher_id(*),
        session_students(student_id, profiles(*))
      `, { count: 'exact' });

    // Apply filters
    if (fromDate) {
      const fromDateIso = fromDate instanceof Date 
        ? fromDate.toISOString() 
        : new Date(fromDate).toISOString();
      query = query.gte('date_time', fromDateIso);
    }

    if (toDate) {
      const toDateIso = toDate instanceof Date 
        ? toDate.toISOString() 
        : new Date(toDate).toISOString();
      query = query.lte('date_time', toDateIso);
    }

    if (teacherId) {
      query = query.eq('teacher_id', teacherId);
    }

    if (studentId) {
      query = query.eq('session_students.student_id', studentId);
    }

    if (status && status.length > 0) {
      // Safely convert to string array before passing to Supabase
      const statusStrings = status.map(s => s.toString());
      query = query.in('status', statusStrings);
    }

    // Apply pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to).order('date_time', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching sessions:', error);
      throw error;
    }

    // Transform the raw sessions
    const transformedSessions = data.map(session => transformSessionWithStudents(session));

    // Calculate pagination info
    const totalPages = count ? Math.ceil(count / pageSize) : 0;
    const pagination: PaginationState = {
      currentPage: page,
      totalPages,
      pageSize,
      totalCount: count || 0
    };

    return { sessions: transformedSessions, pagination };
  };

  return useQuery({
    queryKey: ['sessions', props],
    queryFn: fetchSessions,
  });
};
