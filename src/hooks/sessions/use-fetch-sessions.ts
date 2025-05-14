
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AttendanceStatus } from '@/lib/types';
import { transformSessionWithStudents } from './session-transformers';
import { SessionsProps, PaginationState } from './types';
import { assertAttendanceStatusArray } from '@/lib/type-utils';

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
        // Convert array of AttendanceStatus to string array and ensure they are valid
        const validStatusArray = assertAttendanceStatusArray(status);
        if (validStatusArray.length > 0) {
          query = query.in('status', validStatusArray as AttendanceStatus[]);
        }
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

      // Fetch profiles for all student IDs
      const studentIds = Object.values(studentsBySession).flat().map(s => s.student_id);
      let studentProfiles: Record<string, any> = {};
      
      if (studentIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name, email')
          .in('id', studentIds);
          
        if (profilesError) {
          console.error('Error fetching student profiles:', profilesError);
        } else if (profilesData) {
          // Index profiles by ID for quick lookup
          studentProfiles = profilesData.reduce((acc, profile) => {
            acc[profile.id] = profile;
            return acc;
          }, {} as Record<string, any>);
        }
      }

      // Add students to each session with their profile data
      const sessionsWithStudents = sessionsData.map(session => {
        const sessionStudents = studentsBySession[session.id] || [];
        return {
          ...session,
          session_students: sessionStudents.map(s => ({
            ...s,
            profile: studentProfiles[s.student_id] || null
          }))
        };
      });

      // Filter by student if needed (after we have the session_students data)
      const filteredSessions = studentId 
        ? sessionsWithStudents.filter(session => 
            (studentsBySession[session.id] || []).some(s => s.student_id === studentId)
          ) 
        : sessionsWithStudents;

      // Transform each session
      const transformedSessions = await Promise.all(filteredSessions.map(async (session) => {
        return transformSessionWithStudents(session);
      }));

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
