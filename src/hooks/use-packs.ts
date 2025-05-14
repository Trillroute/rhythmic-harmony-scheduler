
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SessionPack, PackSize, SubjectType, SessionType, LocationType, WeeklyFrequency } from '@/lib/types';
import { toast } from 'sonner';
import { 
  assertSubjectType, 
  assertSessionType, 
  assertLocationType,
  assertWeeklyFrequency 
} from '@/lib/type-utils';

interface CreateSessionPackInput {
  studentId: string;
  size: PackSize;
  subject: SubjectType;
  sessionType: SessionType;
  location: LocationType;
  purchasedDate: Date;
  expiryDate?: Date;
  remainingSessions: number;
  isActive: boolean;
  weeklyFrequency: WeeklyFrequency;
}

// Hook for fetching session packs
export const useSessionPacks = (studentId?: string) => {
  return useQuery({
    queryKey: ['session-packs', studentId],
    queryFn: async () => {
      // Build query with optional filters
      let query = supabase.from('session_packs').select('*');
      
      // Apply student filter if provided
      if (studentId) {
        query = query.eq('student_id', studentId);
      }
      
      // Execute query
      const { data, error } = await query;
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Transform data to match frontend types
      return data.map((pack: any) => ({
        id: pack.id,
        studentId: pack.student_id,
        size: pack.size,
        subject: assertSubjectType(pack.subject),
        sessionType: assertSessionType(pack.session_type),
        location: assertLocationType(pack.location),
        purchasedDate: new Date(pack.purchased_date),
        expiryDate: pack.expiry_date ? new Date(pack.expiry_date) : undefined,
        remainingSessions: pack.remaining_sessions,
        isActive: pack.is_active,
        weeklyFrequency: assertWeeklyFrequency(pack.weekly_frequency),
        createdAt: new Date(pack.created_at),
        updatedAt: new Date(pack.updated_at)
      }) as SessionPack);
    }
  });
};

// Hook for creating a session pack
export const useCreateSessionPack = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (packData: CreateSessionPackInput) => {
      // Convert frontend types to database format
      const { data, error } = await supabase
        .from('session_packs')
        .insert({
          student_id: packData.studentId,
          size: packData.size,
          subject: packData.subject,
          session_type: packData.sessionType,
          location: packData.location,
          purchased_date: packData.purchasedDate.toISOString(),
          expiry_date: packData.expiryDate?.toISOString(),
          remaining_sessions: packData.remainingSessions,
          is_active: packData.isActive,
          weekly_frequency: packData.weeklyFrequency
        })
        .select();
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['session-packs', variables.studentId] });
      toast.success('Session pack created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create session pack: ${error.message}`);
    }
  });
};
