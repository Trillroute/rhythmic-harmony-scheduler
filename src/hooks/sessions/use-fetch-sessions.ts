
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AttendanceStatus } from '@/lib/types';
import { transformSessionWithStudents } from './session-transformers';
import { SessionsProps, PaginationState } from './types';

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
    try {
      let query = supabase
        .from('sessions')
        .select(`
          *,
          profiles:teacher_id(*)
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

      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to).order('date_time', { ascending: false });

      if (status && status.length > 0) {
        // Convert array of AttendanceStatus to string array for Supabase
        const statusStrings = status.map(s => s.toString());
        query = query.in('status', statusStrings);
      }

      const { data: sessionsData, error, count } = await query;

      if (error) {
        console.error('Error fetching sessions:', error);
        throw error;
      }

      // Fetch all student IDs for these sessions
      const sessionIds = sessionsData.map(session => session.id);
      
      let studentsBySession: Record<string, { student_id: string }[]> = {};
      
      if (sessionIds.length > 0) {
        const { data: sessionStudentsData, error: sessionStudentsError } = await supabase
          .from('session_students')
          .select('session_id, student_id')
          .in('session_id', sessionIds);

        if (sessionStudentsError) {
          console.error('Error fetching session students:', sessionStudentsError);
        } else if (sessionStudentsData) {
          // Group students by session ID
          studentsBySession = sessionStudentsData.reduce((acc, curr) => {
            if (!acc[curr.session_id]) {
              acc[curr.session_id] = [];
            }
            acc[curr.session_id].push({ student_id: curr.student_id });
            return acc;
          }, {} as Record<string, { student_id: string }[]>);
        }
      }

      // Add students to each session
      const sessionsWithStudents = sessionsData.map(session => ({
        ...session,
        session_students: studentsBySession[session.id] || []
      }));

      // Filter by student if needed (after we have the session_students data)
      const filteredSessions = studentId 
        ? sessionsWithStudents.filter(session => 
            (studentsBySession[session.id] || []).some(s => s.student_id === studentId)
          ) 
        : sessionsWithStudents;

      // Transform each session (now with all required data)
      const transformPromises = filteredSessions.map(transformSessionWithStudents);
      const transformedSessions = await Promise.all(transformPromises);

      // Calculate pagination info
      const totalPages = count ? Math.ceil(count / pageSize) : 0;
      const pagination: PaginationState = {
        currentPage: page,
        totalPages,
        pageSize,
        totalCount: count || 0
      };

      return { sessions: transformedSessions, pagination };
    } catch (error) {
      console.error('Error in fetchSessions:', error);
      throw error;
    }
  };

  return useQuery({
    queryKey: ['sessions', props],
    queryFn: fetchSessions,
  });
};
