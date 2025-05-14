
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LocationType, PackSize, SessionPack, SessionType, SubjectType, WeeklyFrequency } from "@/lib/types";
import { toast } from "sonner";

interface CreatePackParams {
  studentId: string;
  subject: SubjectType;
  sessionType: SessionType;
  location: LocationType;
  size: PackSize;
  weeklyFrequency: WeeklyFrequency;
  purchasedDate?: Date;
  expiryDate?: Date;
}

export const usePacks = (studentId?: string) => {
  const queryClient = useQueryClient();

  const packQuery = useQuery({
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
      
      return data;
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

      const packData = {
        student_id: studentId,
        subject,
        session_type: sessionType,
        location,
        size: size.toString(), // Convert to string for DB compatibility
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
      
      // Convert size and dates to string for DB compatibility
      const packData = {
        ...updatedData,
        size: updatedData.size?.toString(),
        purchased_date: updatedData.purchasedDate ? new Date(updatedData.purchasedDate).toISOString() : undefined,
        expiry_date: updatedData.expiryDate ? new Date(updatedData.expiryDate).toISOString() : null
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
    packs: packQuery.data || [],
    isLoading: packQuery.isLoading,
    error: packQuery.error,
    createPack: createPackMutation.mutateAsync,
    updatePack: updatePackMutation.mutateAsync,
    isPendingCreate: createPackMutation.isPending,
    isPendingUpdate: updatePackMutation.isPending
  };
};
