
// Fix the PackSize casting to string for Supabase

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PackSize, SubjectType, SessionType, LocationType, WeeklyFrequency } from "@/lib/types";
import { toast } from "sonner";

// Function to convert PackSize enum to string for Supabase
const packSizeToString = (size: PackSize): string => {
  return String(size);
};

export interface CreatePackProps {
  studentId: string;
  size: PackSize;
  subject: SubjectType;
  sessionType: SessionType;
  location: LocationType;
  weeklyFrequency: WeeklyFrequency;
  expiryDate?: Date;
}

export const useFetchPacks = (studentId?: string) => {
  return useQuery({
    queryKey: ["packs", studentId],
    queryFn: async () => {
      try {
        let query = supabase
          .from("session_packs")
          .select("*, sessions(*)");
        
        if (studentId) {
          query = query.eq('student_id', studentId);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        return data || [];
      } catch (error: any) {
        console.error("Error fetching packs:", error);
        throw new Error("Failed to fetch session packs");
      }
    },
    enabled: Boolean(studentId),
  });
};

export const useCreatePack = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (packData: CreatePackProps) => {
      try {
        const packObject = {
          student_id: packData.studentId,
          size: packSizeToString(packData.size),
          subject: packData.subject,
          session_type: packData.sessionType,
          location: packData.location,
          weekly_frequency: packData.weeklyFrequency,
          remaining_sessions: packData.size,
          expiry_date: packData.expiryDate ? packData.expiryDate.toISOString() : null,
          is_active: true
        };
        
        const { data, error } = await supabase
          .from("session_packs")
          .insert(packObject)
          .select()
          .single();
        
        if (error) throw error;
        
        return data;
      } catch (error: any) {
        console.error("Error creating pack:", error);
        throw new Error(error.message || "Failed to create session pack");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["packs"] });
      toast.success("Session pack created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create pack: ${error.message}`);
    }
  });
};

export const useUpdatePack = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string, [key: string]: any }) => {
      try {
        // Handle size conversion if it's in the updates
        const preparedUpdates = { ...updates };
        if (updates.size) {
          preparedUpdates.size = packSizeToString(updates.size);
        }
        
        const { data, error } = await supabase
          .from("session_packs")
          .update(preparedUpdates)
          .eq('id', id)
          .select()
          .single();
        
        if (error) throw error;
        
        return data;
      } catch (error: any) {
        console.error("Error updating pack:", error);
        throw new Error(error.message || "Failed to update session pack");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["packs"] });
      toast.success("Session pack updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update pack: ${error.message}`);
    }
  });
};

export const usePacks = () => {
  const createPack = useCreatePack();
  const updatePack = useUpdatePack();
  
  return {
    createPack: createPack.mutateAsync,
    updatePack: updatePack.mutateAsync,
    isPendingCreate: createPack.isPending,
    isPendingUpdate: updatePack.isPending
  };
};
