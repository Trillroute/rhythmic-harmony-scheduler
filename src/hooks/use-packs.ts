
import { useState, useEffect, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SessionPack, SubjectType, SessionType, LocationType, WeeklyFrequency, PackSize } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { assertSubjectType, assertSessionType, assertLocationType, assertWeeklyFrequency } from '@/lib/type-utils';

// Define the interface for session pack data
interface SessionPackData {
  id: string;
  studentId: string;
  size: PackSize;
  subject: SubjectType;
  sessionType: SessionType;
  location: LocationType;
  purchasedDate: string | Date;
  expiryDate?: string | Date;
  remainingSessions: number;
  isActive: boolean;
  weeklyFrequency: WeeklyFrequency;
  createdAt: string | Date;
  updatedAt: string | Date;
}

// Define interface for create session pack props
interface CreateSessionPackProps {
  studentId: string;
  size: PackSize;
  subject: SubjectType;
  sessionType: SessionType;
  location: LocationType;
  weeklyFrequency: WeeklyFrequency;
}

// Transform database session pack to frontend session pack
const transformSessionPack = (dbPack: any): SessionPack => {
  return {
    id: dbPack.id,
    studentId: dbPack.student_id,
    size: dbPack.size as PackSize,
    subject: assertSubjectType(dbPack.subject),
    sessionType: assertSessionType(dbPack.session_type),
    location: assertLocationType(dbPack.location),
    purchasedDate: dbPack.purchased_date,
    expiryDate: dbPack.expiry_date,
    remainingSessions: dbPack.remaining_sessions,
    isActive: dbPack.is_active,
    weeklyFrequency: assertWeeklyFrequency(dbPack.weekly_frequency),
    createdAt: dbPack.created_at,
    updatedAt: dbPack.updated_at
  };
};

// Hook to fetch session packs
export const useSessionPacks = (studentId?: string) => {
  const [sessionPacks, setSessionPacks] = useState<SessionPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessionPacks = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase.from('session_packs').select('*');
      
      if (studentId) {
        query = query.eq('student_id', studentId);
      }
      
      const { data, error: fetchError } = await query;
      
      if (fetchError) throw new Error(fetchError.message);
      
      const transformedPacks = data?.map(transformSessionPack) || [];
      setSessionPacks(transformedPacks);
    } catch (err: any) {
      console.error('Error fetching session packs:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchSessionPacks();
  }, [fetchSessionPacks]);

  return {
    sessionPacks,
    loading,
    error,
    refetch: fetchSessionPacks
  };
};

// Hook to create a session pack
export const useCreateSessionPack = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (packData: CreateSessionPackProps) => {
      try {
        // Calculate expiry date (3 months from purchase)
        const purchaseDate = new Date();
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 3);
        
        // Prepare the data object for the database
        const dbPackData = {
          student_id: packData.studentId,
          size: String(packData.size) as "4" | "10" | "20" | "30",
          subject: packData.subject,
          session_type: packData.sessionType,
          location: packData.location,
          weekly_frequency: packData.weeklyFrequency,
          remaining_sessions: packData.size,
          expiry_date: expiryDate.toISOString(),
          is_active: true
        };
        
        const { data, error } = await supabase
          .from('session_packs')
          .insert(dbPackData)
          .select()
          .single();
        
        if (error) throw new Error(error.message);
        
        return transformSessionPack(data);
      } catch (err: any) {
        console.error('Error creating session pack:', err);
        throw new Error(err.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessionPacks'] });
      toast({
        title: "Success",
        description: "Session pack created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create session pack: ${error.message}`,
        variant: "destructive",
      });
    }
  });
};

// For backwards compatibility
export const usePacks = useSessionPacks;
