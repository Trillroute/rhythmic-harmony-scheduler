
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
      
      return data as SessionPack[];
    },
    enabled: !!studentId
  });
  
  const createPackMutation = useMutation({
    mutationFn: async (packData: CreateSessionPackParams) => {
      // Format the date to ISO string for Supabase
      const purchasedDateStr = packData.purchasedDate.toISOString();
      
      // Calculate expiry date based on pack size - 30 days per month
      const expiryDate = new Date(packData.purchasedDate);
      if (packData.size === '4') {
        expiryDate.setDate(expiryDate.getDate() + 30); // 1 month
      } else if (packData.size === '12') {
        expiryDate.setDate(expiryDate.getDate() + 90); // 3 months
      } else if (packData.size === '24') {
        expiryDate.setDate(expiryDate.getDate() + 180); // 6 months
      } else if (packData.size === '48') {
        expiryDate.setDate(expiryDate.getDate() + 365); // 1 year
      }
      
      const { data, error } = await supabase
        .from('session_packs')
        .insert([{
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
        }])
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      return data as SessionPack;
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
export const useSessionPacks = usePacks;
export const useCreateSessionPack = (options: any) => {
  const { createPack } = usePacks();
  return { createPack };
};
