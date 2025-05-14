
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AttendanceStatus, SessionWithStudents } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { transformSessionWithStudents } from './session-transformers';
import { SessionsProps } from './types';
import { assertAttendanceStatusArray } from '@/lib/type-utils';

/**
 * Hook to fetch sessions with optional filters
 */
export const useFetchSessions = ({ 
  teacherId, 
  studentId,
  fromDate,
  toDate,
  status 
}: SessionsProps = {}) => {
  const [sessions, setSessions] = useState<SessionWithStudents[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();
  const userId = user?.id;
  const userRole = user?.role;
  
  // Reset error when filter props change
  useEffect(() => {
    setError(null);
  }, [teacherId, studentId, fromDate, toDate, status?.join(',')]);
  
  // Fetch sessions based on filters
  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from('sessions')
        .select(`
          *,
          profiles:teacher_id (name),
          session_students (student_id, profiles:student_id (name))
        `);
      
      // Apply filters
      if (teacherId) {
        query = query.eq('teacher_id', teacherId);
      }
      
      if (fromDate) {
        query = query.gte('date_time', fromDate.toISOString());
      }
      
      if (toDate) {
        query = query.lte('date_time', toDate.toISOString());
      }
      
      // Filter by status if provided
      if (status && Array.isArray(status) && status.length > 0) {
        // Check if the 'all' option is included or no filter is applied
        const hasAllOption = status.some(s => s === 'all' || s === '');
        
        if (!hasAllOption) {
          // Convert all strings to valid AttendanceStatus values
          const validStatuses = assertAttendanceStatusArray(status);
          
          if (validStatuses.length > 0) {
            query = query.in('status', validStatuses);
          }
        }
      }
      
      // Apply role-based filters
      if (userRole === 'teacher' && !teacherId && userId) {
        query = query.eq('teacher_id', userId);
      } else if (userRole === 'student' && !studentId && userId) {
        query = query.eq('session_students.student_id', userId);
      }
      
      // Order by date/time
      query = query.order('date_time', { ascending: true });
      
      const { data, error: fetchError } = await query;
      
      if (fetchError) {
        throw new Error(`Error fetching sessions: ${fetchError.message}`);
      }
      
      if (!data) {
        setSessions([]);
        return;
      }
      
      // Transform the data to include student information
      const transformedSessions = data.map(transformSessionWithStudents);
      
      // Further filter by student if needed
      const filteredSessions = studentId 
        ? transformedSessions.filter(session => 
            session.studentIds.includes(studentId))
        : transformedSessions;
      
      setSessions(filteredSessions);
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch sessions'));
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchSessions();
  }, [teacherId, studentId, fromDate, toDate, status?.join(','), userId, userRole]);
  
  return {
    sessions,
    loading,
    error,
    refreshSessions: fetchSessions
  };
};
