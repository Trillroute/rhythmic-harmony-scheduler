
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { LocationType, PackSize, SessionPack, SessionType, SubjectType, WeeklyFrequency } from '@/lib/types';

// Fetch all session packs for a student
export const useSessionPacks = (studentId?: string) => {
  return useQuery({
    queryKey: ['sessionPacks', studentId],
    queryFn: async () => {
      try {
        let query = supabase
          .from('session_packs')
          .select('*');
          
        if (studentId) {
          query = query.eq('student_id', studentId);
        }
          
        const { data, error } = await query.order('created_at', { ascending: false });
          
        if (error) {
          toast({
            title: 'Error fetching session packs',
            description: error.message,
            variant: 'destructive',
          });
          throw error;
        }
          
        return data as SessionPack[];
      } catch (error) {
        console.error("Error in useSessionPacks:", error);
        return [];
      }
    },
    enabled: true, // we'll handle empty studentId case in the query
  });
};

// Create a new session pack
export const useCreateSessionPack = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (packData: {
      studentId: string;
      size: PackSize;
      subject: SubjectType;
      sessionType: SessionType;
      location: LocationType;
      purchasedDate: Date;
      remainingSessions: number;
      isActive: boolean;
      weeklyFrequency: WeeklyFrequency;
      expiryDate?: Date;
    }) => {
      try {
        // Convert camelCase to snake_case for Supabase
        const formattedData = {
          student_id: packData.studentId,
          size: packData.size,
          subject: packData.subject,
          session_type: packData.sessionType,
          location: packData.location,
          purchased_date: packData.purchasedDate.toISOString(),
          remaining_sessions: packData.remainingSessions,
          is_active: packData.isActive,
          weekly_frequency: packData.weeklyFrequency,
          expiry_date: packData.expiryDate ? packData.expiryDate.toISOString() : null
        };
        
        const { data, error } = await supabase
          .from('session_packs')
          .insert(formattedData)
          .select();
          
        if (error) {
          toast({
            title: 'Error creating session pack',
            description: error.message,
            variant: 'destructive',
          });
          throw error;
        }
        
        toast({
          title: 'Success',
          description: 'Session pack created successfully',
        });
        
        return data;
      } catch (error) {
        console.error("Error in useCreateSessionPack:", error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sessionPacks', variables.studentId] });
      queryClient.invalidateQueries({ queryKey: ['sessionPacks'] });
    }
  });
};

// Update a session pack
export const useUpdateSessionPack = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<SessionPack> & { id: string }) => {
      try {
        const { id, ...updateData } = data;
        
        // Convert camelCase to snake_case for Supabase
        const formattedData: Record<string, any> = {};
        
        if ('studentId' in updateData) formattedData.student_id = updateData.studentId;
        if ('size' in updateData) formattedData.size = updateData.size;
        if ('subject' in updateData) formattedData.subject = updateData.subject;
        if ('sessionType' in updateData) formattedData.session_type = updateData.sessionType;
        if ('location' in updateData) formattedData.location = updateData.location;
        if ('purchasedDate' in updateData) formattedData.purchased_date = updateData.purchasedDate?.toISOString();
        if ('remainingSessions' in updateData) formattedData.remaining_sessions = updateData.remainingSessions;
        if ('isActive' in updateData) formattedData.is_active = updateData.isActive;
        if ('weeklyFrequency' in updateData) formattedData.weekly_frequency = updateData.weeklyFrequency;
        if ('expiryDate' in updateData) formattedData.expiry_date = updateData.expiryDate?.toISOString();
        
        const { error } = await supabase
          .from('session_packs')
          .update(formattedData)
          .eq('id', id);
          
        if (error) {
          toast({
            title: 'Error updating session pack',
            description: error.message,
            variant: 'destructive',
          });
          throw error;
        }
        
        toast({
          title: 'Success',
          description: 'Session pack updated successfully',
        });
        
        return { id, ...updateData };
      } catch (error) {
        console.error("Error in useUpdateSessionPack:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessionPacks'] });
    }
  });
};

// Delete a session pack
export const useDeleteSessionPack = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      try {
        const { error } = await supabase
          .from('session_packs')
          .delete()
          .eq('id', id);
          
        if (error) {
          toast({
            title: 'Error deleting session pack',
            description: error.message,
            variant: 'destructive',
          });
          throw error;
        }
        
        toast({
          title: 'Success',
          description: 'Session pack deleted successfully',
        });
        
        return id;
      } catch (error) {
        console.error("Error in useDeleteSessionPack:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessionPacks'] });
    }
  });
};
