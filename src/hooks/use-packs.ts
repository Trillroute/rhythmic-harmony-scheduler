
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SessionPack } from "@/lib/types";

// Get session packs for a student
export const useSessionPacks = (studentId?: string) => {
  return useQuery({
    queryKey: ["sessionPacks", studentId],
    queryFn: async () => {
      let query = supabase.from("session_packs").select("*");
      
      if (studentId) {
        query = query.eq("student_id", studentId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return data as SessionPack[];
    },
    enabled: !!studentId,
  });
};

// Get a single pack by ID
export const useSessionPack = (packId?: string) => {
  return useQuery({
    queryKey: ["sessionPack", packId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("session_packs")
        .select("*")
        .eq("id", packId)
        .single();
      
      if (error) throw error;
      
      return data as SessionPack;
    },
    enabled: !!packId,
  });
};

// Update a session pack
export const useUpdateSessionPack = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (pack: Partial<SessionPack> & { id: string }) => {
      const { id, ...packData } = pack;
      
      const { data, error } = await supabase
        .from("session_packs")
        .update({
          ...packData,
          // Add type casting for enum fields
          subject: packData.subject?.toString(),
          session_type: packData.sessionType?.toString(),
          location: packData.location?.toString(),
          weekly_frequency: packData.weeklyFrequency?.toString(),
        })
        .eq("id", id)
        .select();
      
      if (error) throw error;
      
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["sessionPacks"] });
      queryClient.invalidateQueries({ queryKey: ["sessionPack", variables.id] });
      toast.success("Session pack updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update session pack: ${error.message}`);
    },
  });
};

// Create one or more session packs
export const useCreateSessionPack = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (packs: Partial<SessionPack> | Partial<SessionPack>[]) => {
      // Handle single or multiple packs
      const packsArray = Array.isArray(packs) ? packs : [packs];
      
      // Format data for insert with proper type casting
      const formattedPacks = packsArray.map(pack => ({
        student_id: pack.studentId,
        size: pack.size,
        subject: pack.subject?.toString(),
        session_type: pack.sessionType?.toString(),
        location: pack.location?.toString(),
        remaining_sessions: pack.remainingSessions,
        is_active: pack.isActive,
        weekly_frequency: pack.weeklyFrequency?.toString(),
        purchased_date: pack.purchasedDate?.toString(),
        expiry_date: pack.expiryDate?.toString(),
      }));
      
      const { data, error } = await supabase
        .from("session_packs")
        .insert(formattedPacks)
        .select();
      
      if (error) throw error;
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessionPacks"] });
      toast.success("Session pack(s) created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create session pack: ${error.message}`);
    },
  });
};

// Delete a session pack
export const useDeleteSessionPack = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (packId: string) => {
      const { error } = await supabase
        .from("session_packs")
        .delete()
        .eq("id", packId);
      
      if (error) throw error;
      
      return packId;
    },
    onSuccess: (packId) => {
      queryClient.invalidateQueries({ queryKey: ["sessionPacks"] });
      queryClient.invalidateQueries({ queryKey: ["sessionPack", packId] });
      toast.success("Session pack deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete session pack: ${error.message}`);
    },
  });
};
