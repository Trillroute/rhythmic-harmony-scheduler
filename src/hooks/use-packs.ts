
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SessionPack, SubjectType, SessionType, LocationType, WeeklyFrequency } from '@/lib/types';
import { toast } from 'sonner';

// Fetch a student's packs
export const useStudentPacks = (studentId?: string) => {
  return useQuery({
    queryKey: ['packs', studentId],
    queryFn: async () => {
      if (!studentId) return [];
      
      const { data, error } = await supabase
        .from('session_packs')
        .select('*')
        .eq('student_id', studentId);
      
      if (error) {
        console.error('Error fetching student packs:', error);
        throw error;
      }
      
      return data as SessionPack[];
    },
    enabled: !!studentId
  });
};

// Fetch all packs
export const useAllPacks = () => {
  return useQuery({
    queryKey: ['packs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('session_packs')
        .select(`
          *,
          students:student_id (
            profiles:id (
              name
            )
          )
        `);
      
      if (error) {
        console.error('Error fetching all packs:', error);
        throw error;
      }
      
      return data as (SessionPack & {
        students: {
          profiles: {
            name: string;
          }
        }
      })[];
    }
  });
};

// Create a new pack
export const useCreatePack = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (packData: {
      student_id: string;
      size: string;
      subject: SubjectType;
      session_type: SessionType;
      location: LocationType;
      purchased_date: string;
      remaining_sessions: number;
      is_active: boolean;
      weekly_frequency: WeeklyFrequency;
    }) => {
      // Convert size string to appropriate enum value for database
      const formattedPackData = {
        ...packData,
        size: packData.size as "4" | "10" | "20" | "30"
      };
      
      const { data, error } = await supabase
        .from('session_packs')
        .insert(formattedPackData)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating pack:', error);
        throw error;
      }
      
      return data as SessionPack;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packs'] });
      toast.success('Pack created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create pack: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });
};

// Update a pack
export const useUpdatePack = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updateData
    }: Partial<SessionPack> & { id: string }) => {
      const { data, error } = await supabase
        .from('session_packs')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating pack:', error);
        throw error;
      }
      
      return data as SessionPack;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packs'] });
      toast.success('Pack updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update pack: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });
};

// Delete a pack
export const useDeletePack = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (packId: string) => {
      const { error } = await supabase
        .from('session_packs')
        .delete()
        .eq('id', packId);
      
      if (error) {
        console.error('Error deleting pack:', error);
        throw error;
      }
      
      return packId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packs'] });
      toast.success('Pack deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete pack: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });
};
