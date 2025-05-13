import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SubjectType, SessionType, LocationType, WeeklyFrequency, SessionPack } from '@/lib/types';

export interface PackWithRelations {
  id: string;
  name: string;
  student_id: string;
  size: number;
  subject: SubjectType;
  session_type: SessionType;
  location: LocationType;
  purchased_date: string;
  expiry_date?: string;
  remaining_sessions: number;
  is_active: boolean;
  weekly_frequency: WeeklyFrequency;
  created_at: string;
  updated_at: string;
  students?: {
    id: string;
    profiles: {
      name: string;
    };
  };
}

// Helper function to transform snake_case to camelCase
const transformPackData = (pack: PackWithRelations): SessionPack => {
  return {
    id: pack.id,
    studentId: pack.student_id,
    size: pack.size as any, // Type assertion to keep compatibility
    subject: pack.subject,
    sessionType: pack.session_type,
    location: pack.location,
    purchasedDate: pack.purchased_date,
    expiryDate: pack.expiry_date,
    remainingSessions: pack.remaining_sessions,
    isActive: pack.is_active,
    weeklyFrequency: pack.weekly_frequency,
    createdAt: pack.created_at,
    updatedAt: pack.updated_at
  };
};

export const usePacks = () => {
  return useQuery({
    queryKey: ['packs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('session_packs')
        .select(`
          *,
          students (
            id,
            profiles (
              name
            )
          )
        `)
        .order('created_at', { ascending: false });
  
      if (error) {
        throw error;
      }
  
      // Keep the original data format for now since components are using it
      return data as PackWithRelations[];
    }
  });
};

export const useSessionPacks = (studentId?: string) => {
  return useQuery({
    queryKey: ['packs', studentId],
    queryFn: async () => {
      let query = supabase
        .from('session_packs')
        .select(`
          *,
          students (
            id,
            profiles (
              name
            )
          )
        `);
      
      if (studentId) {
        query = query.eq('student_id', studentId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      // Return data in the original format
      return data as PackWithRelations[];
    },
    enabled: !!studentId
  });
};

export const useCreateSessionPack = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (packData: {
      name?: string;
      student_id: string;
      size: number;
      subject: SubjectType;
      session_type: SessionType;
      location: LocationType;
      remaining_sessions: number;
      weekly_frequency: WeeklyFrequency;
      purchased_date?: string | Date;
      expiry_date?: string | Date;
      is_active?: boolean;
    }) => {
      const formattedData = {
        ...packData,
        purchased_date: packData.purchased_date 
          ? typeof packData.purchased_date === 'string'
            ? packData.purchased_date
            : packData.purchased_date.toISOString()
          : new Date().toISOString(),
        expiry_date: packData.expiry_date
          ? typeof packData.expiry_date === 'string'
            ? packData.expiry_date
            : packData.expiry_date.toISOString()
          : null,
        is_active: packData.is_active !== undefined ? packData.is_active : true
      };
      
      const { data, error } = await supabase
        .from('session_packs')
        .insert(formattedData)
        .select('*')
        .single();
        
      if (error) {
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packs'] });
      toast.success('Session pack created successfully');
    },
    onError: (error: any) => {
      toast.error(`Error creating session pack: ${error.message}`);
    }
  });
};

export const useUpdateSessionPack = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, packData }: { 
      id: string;
      packData: Partial<{
        name: string;
        student_id: string;
        size: number;
        subject: SubjectType;
        session_type: SessionType;
        location: LocationType;
        remaining_sessions: number;
        weekly_frequency: WeeklyFrequency;
        purchased_date: string | Date;
        expiry_date: string | Date;
        is_active: boolean;
      }>;
    }) => {
      // Format dates if they're Date objects
      const formattedData = {
        ...packData,
        purchased_date: packData.purchased_date 
          ? typeof packData.purchased_date === 'string'
            ? packData.purchased_date
            : packData.purchased_date.toISOString()
          : undefined,
        expiry_date: packData.expiry_date
          ? typeof packData.expiry_date === 'string'
            ? packData.expiry_date
            : packData.expiry_date.toISOString()
          : undefined
      };
      
      const { data, error } = await supabase
        .from('session_packs')
        .update(formattedData)
        .eq('id', id)
        .select('*')
        .single();
        
      if (error) {
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packs'] });
      toast.success('Session pack updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Error updating session pack: ${error.message}`);
    }
  });
};
