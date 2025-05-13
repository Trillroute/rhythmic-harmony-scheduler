import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Pack, SubjectType } from "@/lib/types";

export interface PackWithRelations extends Pack {
  student?: {
    id: string;
    name: string;
    email: string;
  };
}

export const usePacks = (studentId?: string) => {
  const queryClient = useQueryClient();

  // Fetch packs for a specific student
  const { data: packs, isLoading, error } = useQuery({
    queryKey: ['packs', studentId],
    queryFn: async () => {
      let query = supabase
        .from('packs')
        .select(`
          *,
          profiles!student_id (
            id,
            name,
            email
          )
        `)
        .order('created_at', { ascending: false });
      
      if (studentId) {
        query = query.eq('student_id', studentId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return data.map((pack) => ({
        id: pack.id,
        student_id: pack.student_id,
        subject: pack.subject,
        total_sessions: pack.total_sessions,
        remaining_sessions: pack.remaining_sessions,
        price: pack.price,
        purchased_date: pack.purchased_date,
        expiry_date: pack.expiry_date,
        created_at: pack.created_at,
        student: pack.profiles ? {
          id: pack.profiles.id,
          name: pack.profiles.name,
          email: pack.profiles.email
        } : undefined
      } as PackWithRelations));
    }
  });

  // Create a new pack
  const createPack = useMutation({
    mutationFn: async (packData: Partial<Pack>) => {
      // Ensure we have the required fields
      if (!packData.student_id || !packData.subject || !packData.total_sessions || 
          !packData.price || !packData.purchased_date || !packData.expiry_date) {
        throw new Error("Missing required pack fields");
      }
      
      const formattedData: Record<string, any> = {};
      
      // Convert Date objects to ISO strings if present
      Object.entries(packData).forEach(([key, value]) => {
        if (key === 'expiry_date' || key === 'purchased_date') {
          formattedData[key] = typeof value === 'object' && value !== null && 'getTime' in value 
            ? value.toISOString() 
            : value;
        } else {
          formattedData[key] = value;
        }
      });
      
      const { data, error } = await supabase
        .from('packs')
        .insert(formattedData)
        .select('id')
        .single();
      
      if (error) throw error;
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packs'] });
      toast.success("Pack created successfully");
    },
    onError: (error: any) => {
      toast.error(`Error creating pack: ${error.message}`);
    }
  });

  // Update an existing pack
  const updatePack = useMutation({
    mutationFn: async (packData: Partial<Pack> & { id: string }) => {
      const { id, ...updateFields } = packData;
      
      const formattedData: Record<string, any> = {};
      
      // Convert Date objects to ISO strings if present
      Object.entries(packData).forEach(([key, value]) => {
        if (key === 'expiry_date' || key === 'purchased_date') {
          formattedData[key] = typeof value === 'object' && value !== null && value instanceof Date
            ? value.toISOString() 
            : value;
        } else {
          formattedData[key] = value;
        }
      });
      
      const { error } = await supabase
        .from('packs')
        .update(formattedData)
        .eq('id', id);
      
      if (error) throw error;
      
      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packs'] });
      toast.success("Pack updated successfully");
    },
    onError: (error: any) => {
      toast.error(`Error updating pack: ${error.message}`);
    }
  });

  // Delete a pack
  const deletePack = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('packs')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packs'] });
      toast.success("Pack deleted successfully");
    },
    onError: (error: any) => {
      toast.error(`Error deleting pack: ${error.message}`);
    }
  });

  return {
    packs,
    isLoading,
    error,
    createPack: createPack.mutateAsync,
    updatePack: updatePack.mutateAsync,
    deletePack: deletePack.mutateAsync,
    isPendingCreate: createPack.isPending,
    isPendingUpdate: updatePack.isPending,
    isPendingDelete: deletePack.isPending
  };
};
