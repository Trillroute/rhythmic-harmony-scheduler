
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LocationType, SubjectType, SessionType, WeeklyFrequency } from "@/lib/types";
import { toast } from "sonner";
import { assertPackSize } from "@/lib/type-utils";

// Export the SessionPack type so it can be used in other files
export interface SessionPack {
  id: string;
  student_id: string;
  subject: SubjectType;
  session_type: SessionType;
  location: LocationType;
  size: string;
  remaining_sessions: number;
  purchased_date: string;
  expiry_date: string | null;
  is_active: boolean;
  weekly_frequency: WeeklyFrequency;
  created_at?: string;
  updated_at?: string;
}

interface CreatePackParams {
  studentId: string;
  subject: SubjectType;
  sessionType: SessionType;
  location: LocationType;
  size: string;
  weeklyFrequency: WeeklyFrequency;
  purchasedDate?: Date;
  expiryDate?: Date;
}

export const usePacks = (studentId?: string) => {
  const queryClient = useQueryClient();

  const { 
    data, 
    isLoading, 
    error, 
    isError 
  } = useQuery({
    queryKey: ["session-packs", studentId],
    queryFn: async () => {
      let query = supabase
        .from("session_packs")
        .select("*");
      
      if (studentId) {
        query = query.eq("student_id", studentId);
      }
      
      query = query.order("created_at", { ascending: false });
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return data as SessionPack[];
    },
    enabled: !!studentId
  });

  const createPackMutation = useMutation({
    mutationFn: async (params: CreatePackParams) => {
      const {
        studentId,
        subject,
        sessionType,
        location,
        size,
        weeklyFrequency,
        purchasedDate = new Date(),
        expiryDate
      } = params;

      // Convert PackSize to string for the database
      const packData = {
        student_id: studentId,
        subject,
        session_type: sessionType,
        location,
        size, // Already a string
        remaining_sessions: Number(size),
        purchased_date: purchasedDate.toISOString(),
        expiry_date: expiryDate ? expiryDate.toISOString() : null,
        is_active: true,
        weekly_frequency: weeklyFrequency
      };

      const { data, error } = await supabase
        .from("session_packs")
        .insert(packData)
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session-packs", studentId] });
      toast.success("Session pack created successfully!");
    },
    onError: (error) => {
      console.error("Error creating session pack:", error);
      toast.error(`Failed to create session pack: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  });

  const updatePackMutation = useMutation({
    mutationFn: async (pack: Partial<SessionPack> & { id: string }) => {
      const { id, ...updatedData } = pack;
      
      // Convert dates to string for DB compatibility
      const packData = {
        ...updatedData,
        purchased_date: updatedData.purchased_date ? new Date(updatedData.purchased_date).toISOString() : undefined,
        expiry_date: updatedData.expiry_date ? new Date(updatedData.expiry_date).toISOString() : null
      };
      
      const { data, error } = await supabase
        .from("session_packs")
        .update(packData)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session-packs", studentId] });
      toast.success("Session pack updated successfully!");
    },
    onError: (error) => {
      console.error("Error updating session pack:", error);
      toast.error(`Failed to update session pack: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  });

  return {
    packs: data || [],
    isLoading,
    error,
    isError,
    createPack: createPackMutation.mutateAsync,
    updatePack: updatePackMutation.mutateAsync,
    isPendingCreate: createPackMutation.isPending,
    isPendingUpdate: updatePackMutation.isPending
  };
};

// Create wrapper functions with more specific names
export const useSessionPacks = (studentId?: string) => {
  return usePacks(studentId);
};

// For creating session packs
export const useCreateSessionPack = () => {
  const { createPack } = usePacks();
  return { createPack };
};
