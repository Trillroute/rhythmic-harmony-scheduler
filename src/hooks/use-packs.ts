
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LocationType, PackSize, SessionPack, SessionType, SubjectType, WeeklyFrequency } from '@/lib/types';

export const usePacks = (studentId?: string) => {
  const queryClient = useQueryClient();

  const fetchPacks = async () => {
    try {
      let query = supabase
        .from('session_packs')
        .select('*');

      if (studentId) {
        query = query.eq('student_id', studentId);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      // Transform the data to match our SessionPack interface
      const packs = data.map((pack): SessionPack => ({
        id: pack.id,
        studentId: pack.student_id,
        sessionType: pack.session_type as SessionType,
        subject: pack.subject as SubjectType,
        size: pack.size as unknown as PackSize, // Convert string to number
        purchasedDate: pack.purchased_date,
        expiryDate: pack.expiry_date,
        remainingSessions: pack.remaining_sessions,
        location: pack.location as LocationType,
        isActive: pack.is_active,
        weeklyFrequency: pack.weekly_frequency as WeeklyFrequency
      }));

      return packs;
    } catch (error) {
      console.error("Error fetching session packs:", error);
      throw error;
    }
  };

  const createPack = useMutation({
    mutationFn: async (pack: Omit<SessionPack, 'id'>) => {
      // Convert our SessionPack interface to match the database schema
      const { data, error } = await supabase
        .from('session_packs')
        .insert({
          student_id: pack.studentId,
          size: String(pack.size) as any, // Convert number to string
          subject: pack.subject,
          session_type: pack.sessionType,
          location: pack.location,
          purchased_date: pack.purchasedDate,
          remaining_sessions: pack.remainingSessions,
          is_active: pack.isActive,
          weekly_frequency: pack.weeklyFrequency,
          expiry_date: pack.expiryDate
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session-packs'] });
    }
  });

  return {
    packs: useQuery({
      queryKey: ['session-packs', studentId],
      queryFn: fetchPacks,
    }),
    createPack,
  };
};

// Add these exports for backward compatibility
export const useSessionPacks = usePacks;
export const useCreateSessionPack = (studentId?: string) => {
  const { createPack } = usePacks(studentId);
  return createPack;
};
