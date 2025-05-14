
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LocationType, PackSize, SubjectType, WeeklyFrequency } from '@/lib/types';

export interface SessionPack {
  id: string;
  student_id: string;
  subject: SubjectType;
  session_type: 'Solo' | 'Duo' | 'Focus';
  location: LocationType;
  size: PackSize;
  purchased_date: string;
  expiry_date: string;
  remaining_sessions: number;
  weekly_frequency: WeeklyFrequency;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateSessionPackParams {
  studentId: string;
  size: PackSize;
  subject: SubjectType;
  sessionType: 'Solo' | 'Duo' | 'Focus';
  location: LocationType;
  purchasedDate: Date;
  remainingSessions: number;
  isActive?: boolean;
  weeklyFrequency: WeeklyFrequency;
}

export const usePacks = (studentId?: string) => {
  const queryClient = useQueryClient();
  
  const packsQuery = useQuery({
    queryKey: ['session-packs', studentId],
    queryFn: async () => {
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
      
      // Transform the database result to match our interface
      return data.map((pack): SessionPack => ({
        id: pack.id,
        student_id: pack.student_id,
        subject: pack.subject as SubjectType,
        session_type: pack.session_type as 'Solo' | 'Duo' | 'Focus',
        location: pack.location as LocationType,
        size: Number(pack.size) as PackSize,
        purchased_date: pack.purchased_date,
        expiry_date: pack.expiry_date,
        remaining_sessions: pack.remaining_sessions,
        weekly_frequency: pack.weekly_frequency as WeeklyFrequency,
        is_active: pack.is_active,
        created_at: pack.created_at,
        updated_at: pack.updated_at
      }));
    },
    enabled: !!studentId
  });
  
  const createPackMutation = useMutation({
    mutationFn: async (packData: CreateSessionPackParams) => {
      // Format the date to ISO string for Supabase
      const purchasedDateStr = packData.purchasedDate.toISOString();
      
      // Calculate expiry date based on pack size - 30 days per month
      const expiryDate = new Date(packData.purchasedDate);
      if (packData.size === 4) {
        expiryDate.setDate(expiryDate.getDate() + 30); // 1 month
      } else if (packData.size === 10) {
        expiryDate.setDate(expiryDate.getDate() + 90); // 3 months
      } else if (packData.size === 20) {
        expiryDate.setDate(expiryDate.getDate() + 180); // 6 months
      } else if (packData.size === 30) {
        expiryDate.setDate(expiryDate.getDate() + 365); // 1 year
      }
      
      const { data, error } = await supabase
        .from('session_packs')
        .insert({
          student_id: packData.studentId,
          subject: packData.subject,
          session_type: packData.sessionType,
          location: packData.location,
          size: packData.size,
          purchased_date: purchasedDateStr,
          expiry_date: expiryDate.toISOString(),
          remaining_sessions: packData.remainingSessions,
          weekly_frequency: packData.weeklyFrequency,
          is_active: packData.isActive ?? true
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // Transform the database result to match our interface
      return {
        id: data.id,
        student_id: data.student_id,
        subject: data.subject as SubjectType,
        session_type: data.session_type as 'Solo' | 'Duo' | 'Focus',
        location: data.location as LocationType,
        size: Number(data.size) as PackSize,
        purchased_date: data.purchased_date,
        expiry_date: data.expiry_date,
        remaining_sessions: data.remaining_sessions,
        weekly_frequency: data.weekly_frequency as WeeklyFrequency,
        is_active: data.is_active,
        created_at: data.created_at,
        updated_at: data.updated_at
      } as SessionPack;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session-packs'] });
      toast.success('Session pack created successfully');
    },
    onError: (error) => {
      console.error('Error creating session pack:', error);
      toast.error(`Failed to create session pack: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });
  
  return {
    packs: packsQuery,
    createPack: createPackMutation.mutate,
  };
};

// For backwards compatibility
export const useSessionPacks = (studentId?: string) => {
  return usePacks(studentId);
};

export const useCreateSessionPack = () => {
  const { createPack } = usePacks();
  return { createPack };
};
